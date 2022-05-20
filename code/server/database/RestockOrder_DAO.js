'use strict';
const DatabaseConnection = require("./DatabaseConnection");

const db = DatabaseConnection.getInstance();


exports.selectRestockOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM RestockOrder;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new RestockOrder(r.ROID, r.issueDate, r.state, r.products, r.supplierId, r.transportNote)));
            }
        });
    });
}

exports.selectRestockOrdersIssued = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM RestockOrder WHERE state = ?;`;
        db.all(sql, ['issued'], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new RestockOrder(r.ROID, r.issueDate, r.state, r.products, r.supplierId, r.transportNote)));
            }
        });
    });
}

exports.insertRestockOrder = (newRO) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO RestockOrder(issueDate, state, products, supplierId, transportNote) VALUES (?, ?, ?, ?, ?);`;
        db.run(sql, [newRO.issueDate, newRO.state, newRO.products, newRO.supplierId, newRO.transportNote], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.updateRestockOrder = (newRO) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE RestockOrder SET
                     issueDate = ?, state = ?, supplierId = ?, transportNote = ?
                     WHERE ROID = ?`;
        db.run(sql, [newRO.issueDate, newRO.state, newRO.products, newRO.supplierId, newRO.transportNote], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });

}

exports.deleteRestockOrder = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Item WHERE ROID = ?`;
        db.run(sql, [id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.selectRestockOrderByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM RestockOrder WHERE ROID = ?;`;
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err.toString());
            } else {
                if (row) {
                    resolve(new RestockOrder(row.ROID, row.issueDate, row.state, row.products, row.supplierId, row.transportNote));
                } else {
                    resolve(null);
                }
            }
        });
    });
}

exports.selectProducts = (roid) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT skuItems FROM RestockOrder WHERE ROID = ?`;
        const ro = this.selectRestockOrderByID(roid)
        db.all(sql,
            [ro.forEach(x => x.getSKUItems()
                .filter(v => {
                    if (v.getTestResults().filter(w => w.getResult() === false).count() > 0) return true;
                    else return false;
                })
            )], (err, rows) => {
                if (err) {
                    reject(err.toString());
                } else {
                    resolve(rows.map((r) => new RestockOrder(r.ROID, r.issueDate, r.state, r.products, r.supplierId, r.transportNote)));
                }
            });
    });
}

exports.insertProducts = (RO, items) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE RestockOrder SET
                     products = ?
                     WHERE ROID = ?`;
        db.run(sql, [RO.addItems(items), RO.ROID], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });

}