const DatabaseConnection = require("./DatabaseConnection");
const Item = require("../components/Item");


const db = DatabaseConnection.getInstance();

exports.selectItems = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Item;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new Item(r.id, r.description, r.price, r.SKUID, r.supplierID)));
            }
        });
    });
}

exports.selectItemByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Item WHERE id = ?;`;
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err.toString());
            } else {
                if (row) {
                    resolve(new Item(row.id, row.description, row.price, row.SKUID, row.supplierID));
                } else {
                    resolve(null);
                }
            }
        });
    });
}

exports.selectItemBySKUID = (skuid) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Item WHERE SKUID = ?;`;
        db.get(sql, [skuid], (err, row) => {
            if (err) {
                reject(err.toString());
            } else {
                if (row) {
                    resolve(new Item(row.id, row.description, row.price, row.SKUID, row.supplierID));
                } else {
                    resolve(null);
                }
            }
        });
    });
}

exports.insertItem = (item) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Item(id, description, price, SKUID, supplierID) VALUES (?, ?, ?, ?, ?);`;
        db.run(sql, [item.id, item.description, item.price, item.SKUID, item.supplierID], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.updateItem = (item) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Item SET
                     description = ?, price = ?, SKUID = ?, supplierID = ?
                     WHERE id = ?;`;
        db.run(sql, [item.description, item.price, item.SKUID, item.supplierID, item.id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.deleteItemByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Item WHERE id = ?`;
        db.run(sql, [id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}
