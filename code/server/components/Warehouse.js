'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const SKU = require("./SKU");
const SKUItem = require("./SKUItem");

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
            return { status: 422, body: {}, message: typeof id };
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

    async updateSKU(id /*:String*/, description /*: String*/, weight /*: double*/, volume /*: double*/, notes /*: string*/, price /*: double*/, quantity /*: Integer*/) {
        //TODO: UPDATE POSITION FIELDS!!!
        if (typeof id !== 'string' || typeof description !== 'string' || typeof weight !== 'number' || typeof volume !== 'number' ||
            typeof notes !== 'string' || typeof price !== 'number' || typeof quantity != 'number')
            return { status: 422, body: {}, message: {} };
        try {
            let sku = await this.getSKUbyId(id);
            if (sku.status == 404) return { status: 404, body: {}, message: {} };
            await this.databaseHelper.updateSKU(new SKU(id, description, weight, volume, price, notes, quantity));
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 200, body: {}, message: {} };
    }//: void

    //SKUItem API:
    async getSKUItems() {

    }//: List<SKUItem>

    async getSKUItemsBySKU(SKUid /*: String*/) {

    }//: List<SKUItem>

    async getSKUItemByRFID(rfid /*: String*/) {

    } //: SKUItem

    async getSKUItemByRestockOrderid(restockOrderId /*: String*/) {

    }//: List<SKUItem>

    async createSKUItem(rfid /*: String*/, SKUid /*: String*/, dateOfStock /*: String*/) {

    }//: void

    async updateSKUItem(SKUid /*: String*/, new_value /*: Object*/) {

    }//: void

    async deleteSKUItems(rfid /*: String*/) {

    }// : void

}

module.exports = Warehouse;