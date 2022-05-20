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
                resolve(rows.map((r) => new Item(r.ITEMID, r.description, r.price, r.SKUID, r.supplierID)));
            }
        });
    });
}

exports.insertItem = (newItem) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Item(ITEMID, description, price, SKUID, supplierID) VALUES (?, ?, ?, ?, ?);`;
        db.run(sql, [newItem.getItemId(), newItem.getDescription(), newItem.getPrice(), newItem.getSKUId(), newItem.getSupplierId()], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.updateItem = (newItem) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Item SET
                     description = ?, price = ?, SKUID = ?, supplierID = ?
                     WHERE ITEMID = ?;`;
        db.run(sql, [newItem.getDescription(), newItem.getPrice(), newItem.getSKUId(), newItem.getSupplierId(), newItem.getItemId()], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });

}

exports.deleteItem = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Item WHERE ITEMID = ?`;
        db.run(sql, [id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.selectItemByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Item WHERE ITEMID = ?;`;
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err.toString());
            } else {
                if (row) {
                    resolve(new Item(row.ITEMID, row.description, row.price, row.SKUID, row.supplierID));
                } else {
                    resolve(null);
                }
            }
        });
    });
}
