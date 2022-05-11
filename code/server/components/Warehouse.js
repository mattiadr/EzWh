'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const SKU = require("./SKU");
const SKUItem = require("./SKUItem");
const Position = require("./Position")
const dayjs = require("dayjs");

class Warehouse {

    constructor() {
        this.databaseHelper = new DatabaseHelper();
        this.databaseHelper.connect('./database/ezwhDB.db');
        this.createTables();
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

    /*----------------------------SKU-----------------------------------*/

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

    async updateSKU(id /*:String*/, positionId /*String*/, description = "" /*: String*/, weight=-1 /*: double*/, volume=-1 /*: double*/, notes = "" /*: string*/, price = -1 /*: double*/, quantity = -1 /*: Integer*/) {
        //TODO: UPDATE POSITION FIELDS!!!
        if (typeof id !== 'string' || typeof description !== 'string' || typeof weight !== 'number' || typeof volume !== 'number' ||
            typeof notes !== 'string' || typeof price !== 'number' || typeof quantity != 'number')
            return { status: 422, body: {}, message: {} };
        try {
            let sku = await this.getSKUbyId(id);
            if (sku.status == 404) return { status: 404, body: {}, message: {} };
            if (positionId === undefined) {
                let position = sku.body.getPosition();
                if ( position != null)
                    this.updatePosition(position.getPositionID(), position.getAisleID(), position.getRow(), position.getCol(), position.getMaxWeight(), position.getMaxVolume(), position.getOccupiedWeight()+weight, position.getOccupiedVolume()+volume);
                await this.databaseHelper.updateSKU(new SKU(id, description, weight, volume, price, notes, quantity));
            } else {
                let position = await this.getPositionById(positionId);
                if (position.status == 404) return { status: 404, body: {}, message: {} };
                this.updatePosition(position.body.getPositionID(), position.body.getAisleID(), position.body.getRow(), position.body.getCol(), position.body.getMaxWeight(), position.body.getMaxVolume(), position.body.getOccupiedWeight()+sku.body.getWeight(), position.body.getOccupiedVolume()+sku.body.getVolume());
                let oldPosition = sku.body.getPosition();
                if ( oldPosition != null)
                    this.updatePosition(oldPosition.getPositionID(), oldPosition.getAisleID(), oldPosition.getRow(), oldPosition.getCol(), oldPosition.getMaxWeight(), oldPosition.getMaxVolume(), oldPosition.getOccupiedWeight()-sku.body.getWeight(), oldPosition.getOccupiedVolume()-sku.body.getVolume());
                await this.databaseHelper.updateSKU(new SKU(id, sku.body.getDescription(), sku.body.getWeight(), sku.body.getVolume(), sku.body.getPrice(), sku.body.getNotes(), sku.body.getAvailableQuantity(), positionId));
            }
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 200, body: {}, message: {} };
    }//: void

    /*--------------------------------SKUItem-----------------------------------*/

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
        let skuitems = [];
        try {
            await (await this.getSKUItems()).body.forEach((value, key) => { value.SKUID == SKUID && value.available == 1 ? skuitems.push(value) : {} });
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
            if (newAvailable !== 1 || newAvailable !== 0)
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

    /*----------------------------Position------------------------------------*/

    async getPositions() {
        //TODO: USER PERMISSIONS
        let Positions;
        try {
            Positions = await this.databaseHelper.loadPosition();
        } catch (e) {
            return { status: 500, body: {}, message: e };
        }

        return { status: 200, body: Positions };

    }

    async createPosition(positionID /*: String*/, aisleID /*: String*/, row /*: String*/, col /*: String*/, maxWeight /*: Integer*/, maxVolume /*: Integer*/) {
        if (typeof positionID !== 'string' || typeof aisleID !== 'string' || typeof row !== 'string' ||
            typeof col !== 'string' || typeof maxWeight !== 'number' || typeof maxVolume != 'number')
            return { status: 422, body: {}, message: {} };
        if (positionID.slice(0, 4) !== aisleID || positionID.slice(4, 8) !== row || positionID.slice(8, 12) !== col)
            return { status: 422, body: {}, message: {} };

        try {
            let newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
            await this.databaseHelper.storePosition(newPosition);
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 201, body: {} };
    }

    async getPositionById(posID) {
        let positions;
        try {
            positions = await this.getPositions();
            if (positions.body.size == 0 || positions.body.get(posID) == undefined)
                return { status: 404, body: {}, message: {} };
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 200, body: positions.body.get(posID), message: {} };
    }

    async updatePosition(posID /*: String*/, newAisleID, newRow, newCol, newMaxWeight = undefined, newMaxVolume = undefined, newOccupiedWeight = undefined, newOccupiedVolume = undefined) {
        if (typeof posID !== 'string' || typeof newAisleID !== 'string' || typeof newRow !== 'string'|| typeof newCol !== 'string')
                return { status: 422, body: {}, message: {} };
        let newPosID = newAisleID+newRow+newCol;
        try {
            let position = await this.getPositionById(posID);
            if (position.status == 404) return { status: 404, body: {}, message: {} };
            if (newMaxWeight !== undefined) 
                await this.databaseHelper.updatePosition(posID, new Position(newPosID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume));
            else
                await this.databaseHelper.updatePosition(posID, new Position(newPosID, newAisleID, newRow, newCol, position.body.getMaxWeight(), position.body.getMaxVolume(), position.body.getOccupiedWeight(), position.body.getOccupiedVolume()));
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 200, body: {}, message: {} };
    }//: void

    async deletePosition(posID /*: String*/) {
        if (typeof posID !== 'string')
            return { status: 422, body: {}, message: typeof id };
        try {
            let skuitem = await this.getPositionById(posID);
            if (skuitem.status == 404) return { status: 404, body: {}, message: {} };
            await this.databaseHelper.deletePosition(posID);
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 204, body: {}, message: {} };
    }// : void

}

module.exports = Warehouse;