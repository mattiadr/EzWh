'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const SKU = require("./SKU");
const SKUItem = require("./SKUItem");
const dayjs = require("dayjs");

class Warehouse {

    constructor() {
        this.databaseHelper = new DatabaseHelper();
        this.databaseHelper.connect('./database/ezwhDB.db');
    }

    async createTables() {
        this.databaseHelper.createTables()
    }

    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    //SKU API:
    async getSKUs() {
        //TODO: USER PERMISSIONS
        let SKUs;
        try {
            SKUs = await this.databaseHelper.loadSKU();
        } catch (e) {
            return { status: 500, body: {}, message: e };
        }

        return { status: 200, body: SKUs };
    } //: List<SKU>

    async getSKUbyId(id /*: String*/) {
        if (typeof id !== 'string')
            return { status: 422, body: {}, message: {} };
        let skus;
        try {
            skus = await this.getSKUs();
            if (skus.body.size == 0 || skus.body.get(id) == undefined)
                return { status: 404, body: {}, message: {} };

        } catch (e) {
            return { status: 500, body: {}, message: {} };
        }
        return { status: 200, body: skus.body.get(id), message: {} };
    } //: SKU

    async createSKU(description /*: String*/, weight /*: double*/, volume /*: double*/, notes /*: string*/, price /*: double*/, quantity /*: Integer*/) {
        if (typeof description !== 'string' || typeof weight !== 'number' || typeof volume !== 'number' ||
            typeof notes !== 'string' || typeof price !== 'number' || typeof quantity != 'number')
            return { status: 422, body: {}, message: {} };

        try {
            let newSKUid = this.makeid(12);
            let skus = await this.databaseHelper.loadSKU();
            if (skus.size != 0)
                while (skus.has(newSKUid))
                    newSKUid = this.makeid(12);
            let newSKU = new SKU(newSKUid, description, weight, volume, price, notes, quantity);
            await this.databaseHelper.storeSKU(newSKU);
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 201, body: {} };
    }

    async deleteSKU(id /*: String*/) {
        if (typeof id !== 'string')
            return { status: 422, body: {}, message: typeof id };
        try {
            let sku = await this.getSKUbyId(id);
            if (sku.status == 404) return { status: 404, body: {}, message: {} };
            await this.databaseHelper.deleteSKU(id);
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 204, body: {}, message: {} };
    }//: void

    async updateSKU(id /*:String*/, positionId /*String*/, description = "" /*: String*/, weight = -1 /*: double*/, volume = -1 /*: double*/, notes = "" /*: string*/, price = -1 /*: double*/, quantity = -1 /*: Integer*/) {
        //TODO: UPDATE POSITION FIELDS!!!
        if (typeof id !== 'string' || typeof description !== 'string' || typeof weight !== 'number' || typeof volume !== 'number' ||
            typeof notes !== 'string' || typeof price !== 'number' || typeof quantity != 'number')
            return { status: 422, body: {}, message: {} };
        try {
            let sku = await this.getSKUbyId(id);
            if (sku.status == 404) return { status: 404, body: {}, message: {} };
            if (positionId === undefined) await this.databaseHelper.updateSKU(new SKU(id, description, weight, volume, price, notes, quantity));
            else await this.databaseHelper.updateSKU(new SKU(id, sku.body.getDescription(), sku.body.getWeight(), sku.body.getVolume(), sku.body.getPrice(), sku.body.getNotes(), sku.body.getAvailableQuantity(), positionId));
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 200, body: {}, message: {} };
    }//: void

    //SKUItem API:
    async getSKUItems() {
        //TODO: USER PERMISSIONS
        let SKUItems;
        try {
            SKUItems = await this.databaseHelper.loadSKUItem();
        } catch (e) {
            return { status: 500, body: {}, message: e };
        }

        return { status: 200, body: SKUItems };

    }//: List<SKUItem>

    async getSKUItemsBySKU(SKUID /*: String*/) {
        if (typeof SKUID !== 'string')
            return { status: 422, body: {}, message: {} };
        let skuitems=[];
        try {
            await (await this.getSKUItems()).body.forEach((value, key) => {value.SKUID == SKUID && value.available == 1 ? skuitems.push(value) : {}});
            if (skuitems.length == 0)
                return { status: 404, body: {}, message: {} };

        } catch (e) {
            return { status: 500, body: {}, message: {} };
        }
        return { status: 200, body: skuitems, message: {} };
    }//: List<SKUItem>

    async getSKUItemByRFID(rfid /*: String*/) {
        if (typeof rfid !== 'string')
            return { status: 422, body: {}, message: {} };
        let skuitems;
        try {
            skuitems = await this.getSKUItems();
            if (skuitems.body.size == 0 || skuitems.body.get(rfid) == undefined)
                return { status: 404, body: {}, message: {} };

        } catch (e) {
            return { status: 500, body: {}, message: {} };
        }
        return { status: 200, body: skuitems.body.get(rfid), message: {} };

    } //: SKUItem

    async createSKUItem(rfid /*: String*/, skuid /*: String*/, dateOfStock /*: String*/) {
        if (typeof rfid !== 'string' || typeof skuid !== 'string' || typeof dateOfStock !== 'string')
            return { status: 422, body: {}, message: {} };

        let date;
        if (dateOfStock != null && !(date = dayjs(dateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
            return { status: 422, body: {}, message: {} };
        }
        try {
            let newSKUItem = new SKUItem(rfid, skuid, 0, date);
            await this.databaseHelper.storeSKUItem(newSKUItem);
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 201, body: {} };
    }//: void

    async updateSKUItem(rfid /*: String*/, newRFID, newAvailable, newDateOfStock) {
        //TODO: UPDATE POSITION FIELDS!!!
        if (typeof rfid !== 'string' || typeof newRFID !== 'string' || typeof newAvailable !== 'number' || typeof newDateOfStock !== 'string')
            if(newAvailable !== 1 || newAvailable !== 0)
                return { status: 422, body: {}, message: {} };
        let date;
        if (newDateOfStock != null && !(date = dayjs(newDateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
            return { status: 422, body: {}, message: {} };
        }
        try {
            let skuitem = await this.getSKUItemByRFID(rfid);
            if (skuitem.status == 404) return { status: 404, body: {}, message: {} };
            await this.databaseHelper.updateSKUItem(rfid, new SKUItem(newRFID, skuitem.body.getSKUId(), newAvailable, date));
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 200, body: {}, message: {} };
    }//: void

    async deleteSKUItems(rfid /*: String*/) {
        if (typeof rfid !== 'string')
            return { status: 422, body: {}, message: typeof id };
        try {
            let skuitem = await this.getSKUItemByRFID(rfid);
            if (skuitem.status == 404) return { status: 404, body: {}, message: {} };
            await this.databaseHelper.deleteSKUItem(rfid);
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 204, body: {}, message: {} };
    }// : void

}

module.exports = Warehouse;