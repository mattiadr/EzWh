"use strict"
const sqlite = require("sqlite3");
const SKU = require("../components/SKU");
const SKUItem = require("../components/SKUItem");
const dayjs = require("dayjs");

class DatabaseHelper{
    constructor(){
        this.SKUs = new Map();
        this.SKUItems = new Map();
    }

    connect(pathSQLite){
        console.log("New connection with: " + pathSQLite);
        this.db = new sqlite.Database(pathSQLite, (err) => {
            if(err) {
                console.log("Error connection with: " + pathSQLite + " " + err);
                throw err;
            }
        });
    }

    queryDBAll(sql, params=[]){
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if(err) {
                    console.log("Error query: "+sql);
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }

    queryDBRun(sql, params=[]){
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if(err){
                    console.log("Error query: "+sql);
                    reject(err);
                }
                else
                    resolve(true);
            })
        })
    }

    async createTables() {
        // Create the table of SKU in the db if it not exist (just first time)
        await this.queryDBRun(`
        CREATE TABLE IF NOT EXISTS SKU (
            SKUID varchar(12) PRIMARY KEY,
            description varchar(100) NOT NULL,
            weight double NOT NULL,
            volume double NOT NULL,
            price double NOT NULL,
            notes varchar(50) NOT NULL,
            positionId varchar(12),
            availableQuantity integer NOT NULL
        );
        `);

        // Create the table of SKUItem in the db if it not exist (just first time)
        await this.queryDBRun(`
        CREATE TABLE IF NOT EXISTS SKUItem (
            RFID varchar(50) PRIMARY KEY,
            SKUID varchar(12) NOT NULL,
            available boolean DEFAULT 0,
            dateOfStock DATETIME
        );
        `);
        
        //TODO ADD ALL TABLES
    }

    async loadSKU() {// -> //: Map <String,SKU>
        if (this.SKUs.size == 0) { //first time
            let rows = await this.queryDBAll(`SELECT * FROM SKU;`);

            rows.map(row => {
                const sku = new SKU(row.SKUID, row.description, row.weight, row.volume, row.price, row.notes, row.availableQuantity, row.positionId);
                this.SKUs.set(row.SKUID, sku);
            })
        } 
        return this.SKUs;
    } 
    
    async loadSKUItem() { //-> Map<String,SKUItem>
        if (this.SKUItems.size == 0 ) { //first time
            let rows = await this.queryDBAll(`SELECT * FROM SKUItem;`);
            this.SKUItems = new Map();

            rows.map(row => {
                const skuItem = new SKUItem(row.RFID, row.SKUID, row.available, row.dateOfStock);
                this.SKUItems.set(row.RFID, skuItem);
                
            })
        }
        return this.SKUItems;
    }

    async storeSKU(newSKU /*: Object*/) {
        await this.queryDBRun(`
            INSERT INTO SKU(SKUID, description, weight, volume, price, notes, positionId, availableQuantity)
            VALUES(?, ?, ?, ?, ?, ?, ? , ?);
        `,[newSKU.id, newSKU.description, newSKU.weight, newSKU.volume, newSKU.price, newSKU.notes, newSKU.positionId, newSKU.availableQuantity]);
        this.SKUs.set(newSKU.id, newSKU);
    }
    
    async storeSKUItem(newSKUItem /*: Object*/) {
        await this.queryDBRun(`
            INSERT INTO SKUItem(RFID, SKUID, available, dateOfStock)
            VALUES(?, ?, ?, ?);
        `,[newSKUItem.RFID, newSKUItem.SKUID, newSKUItem.available, newSKUItem.dateOfStock]);
        this.SKUItems.set(newSKUItem.RFID, newSKUItem);
    }

    async updateSKU(newSKU /*: Object*/) {
        await this.queryDBRun(`
            UPDATE SKU
            SET description = ?, weight = ?, volume = ?, price = ?, notes = ?, positionId = ?, availableQuantity = ?
            WHERE SKUID=?;
        `,[newSKU.description, newSKU.weight, newSKU.volume, newSKU.price, newSKU.notes, newSKU.position, newSKU.availableQuantity, newSKU.id]);
        this.SKUs.set(newSKU.id, newSKU);

    }

    async updateSKUItem(rfid, newSKUItem /*: Object*/) {
        await this.queryDBRun(`
            UPDATE SKUItem
            SET RFID = ?, available = ?, dateOfStock = ?
            WHERE RFID=?;
        `,[newSKUItem.RFID, newSKUItem.available, newSKUItem.dateOfStock, rfid]);
        this.SKUItems.delete(rfid);
        this.SKUItems.set(rfid, newSKUItem);

    }

    async deleteSKU(SKUid) {
        await this.queryDBRun(`
            DELETE
            FROM SKU
            WHERE SKUID=?;
        `, [SKUid]);
        this.SKUs.delete(SKUid);
    }

    async deleteSKUItem(RFID) {
        await this.queryDBRun(`
            DELETE
            FROM SKUItem
            WHERE RFID=?;
        `, [RFID]);
        this.SKUItems.delete(RFID);
    }
}

module.exports = DatabaseHelper