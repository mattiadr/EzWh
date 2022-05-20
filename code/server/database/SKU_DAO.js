'use strict';
const SKU = require("../components/SKU");
const DatabaseConnection = require("./DatabaseConnection");

const db = DatabaseConnection.getInstance();

exports.selectSKUs = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM SKU;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((row) => new SKU(row.SKUID, row.description, row.weight, row.volume, row.price, row.notes, row.availableQuantity, row.positionId)));
            }
        });
    });
}

exports.selectSKUbyID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM SKU WHERE SKUID = ?;`;
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err.toString());
            } else {
                if (row) {
                    resolve(new SKU(row.SKUID, row.description, row.weight, row.volume, row.price, row.notes, row.availableQuantity, row.positionId));
                } else {
                    resolve(null);
                }
            }
        });
    });
}

exports.insertSKU = (newSKU) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO SKU(description, weight, volume, price, notes, positionId, availableQuantity)
                     VALUES(?, ?, ?, ?, ?, ? , ?);`;
        db.run(sql, [newSKU.getDescription(), newSKU.getWeight(), newSKU.getVolume(), newSKU.getPrice(), newSKU.getNotes(), newSKU.getPosition(), newSKU.getAvailableQuantity()], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.updateSKU = (newSKU) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE SKU
                     SET description = ?, weight = ?, volume = ?, price = ?, notes = ?, positionId = ?, availableQuantity = ?
                     WHERE SKUID=?;`;
        db.run(sql, [newSKU.getDescription(), newSKU.getWeight(), newSKU.getVolume(), newSKU.getPrice(), newSKU.getNotes(), newSKU.getPosition(), newSKU.getAvailableQuantity(), newSKU.getId()], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.deleteSKU = (SKUid) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM SKU WHERE SKUID = ?;`;
        db.run(sql, [SKUid], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}