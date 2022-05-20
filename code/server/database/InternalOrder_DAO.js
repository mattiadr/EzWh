'use strict';
const DatabaseConnection = require("./DatabaseConnection");

const db = DatabaseConnection.getInstance();


exports.selectInternalOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrder;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new InternalOrder(r.internalOrderId, r.issueDate, r.state, r.customerId)));
            }
        });
    });
}

exports.selectInternalOrderByID = (internalOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrder WHERE internalOrderId = ?;`;
        db.get(sql, [internalOrderId], (err, row) => {
            if (err) {
                reject(err.toString());
            } else {
                if (row) {
                    resolve(new InternalOrder(row.internalOrderId, row.issueDate, row.state, row.customerId));
                } else {
                    resolve(null);
                }
            }
        });
    });
}

exports.selectInternalOrdersIssued = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrder WHERE state = ?;`;
        db.all(sql, ['issued'], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new InternalOrder(r.internalOrderId, r.issueDate, r.state, r.customerId)));
            }
        });
    });
}

exports.selectInternalOrdersAccepted = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrder WHERE state = ?;`;
        db.all(sql, ['accepted'], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new InternalOrder(r.internalOrderId, r.issueDate, r.state, r.customerId)));
            }
        });
    });
}

exports.insertInternalOrder = (internalOrder) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO InternalOrder(issueDate, state, customerId) VALUES (?, ?, ?);`;
        db.run(sql, [internalOrder.issueDate, internalOrder.state, internalOrder.customerId], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        })
    });
}

exports.updateInternalOrder = (internalOrder) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE InternalOrder SET state = ? WHERE internalOrderId = ?`;
        db.run(sql, [internalOrder.state, internalOrder.internalOrderId], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.deleteInternalOrder = (internalOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM InternalOrder WHERE internalOrderId = ?`;
        db.run(sql, [internalOrderId], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.selectInternalOrderProducts = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrderProduct;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new InternalOrderProduct(r.internalOrderId, r.ITEMID, r.quantity)));
            }
        });
    });
}

exports.selectInternalOrderProductByID = (internalOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrderProduct WHERE internalOrderId = ?;`;
        db.all(sql, [internalOrderId], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new InternalOrderProduct(r.internalOrderId, r.ITEMID, r.quantity)));
            }
        });
    });
}

exports.insertInternalOrderProduct = (internalOrderProduct) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO InternalOrderProduct(internalOrderId, ITEMID, quantity) VALUES (?, ?, ?);`;
        db.run(sql, [internalOrderProduct.internalOrderId, internalOrderProduct.ITEMID, internalOrderProduct.quantity], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        })
    });
}

exports.deleteInternalOrderProduct = (internalOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM InternalOrderProduct WHERE internalOrderId = ?`;
        db.run(sql, [internalOrderId], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.updateInternalOrderProduct = (internalOrderProduct) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE InternalOrderProduct SET quantity = ? WHERE internalOrderId = ?`;
        db.run(sql, [internalOrderProduct.quantity, internalOrderProduct.internalOrderId, internalOrderProduct.ITEMID], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}