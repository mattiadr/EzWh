'use strict';
const dayjs = require("dayjs");

class SKUItem{

    constructor(RFID, SKUID, available, dateOfStock){
        this.RFID = RFID;
        this.SKUID = SKUID;
        this.available = available;
        this.dateOfStock = dateOfStock;
        this.testResults = [];
    }

    getRFID() { return this.RFID; }
    getSKUId() { return this.SKUID; }
    getAvailable() { return this.available; }
    getDateOfStock() { return this.dateOfStock; }
    getTestResults() { return this.testResults; }

    setRFID(newRFID) { this.RFID = newRFID; }
    setDateOfStock(newDateOfStock) { this.dateOfStock = newDateOfStock; }
    setAvailable(newAvailable) { this.available = newAvailable; }
    addTestResults(newTestResults) { this.testResults.push(newTestResults) }
}

module.exports = SKUItem;