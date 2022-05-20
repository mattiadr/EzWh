const DatabaseConnection = require("./DatabaseConnection");
const ReturnOrder = require("../components/ReturnOrder");
const ReturnOrderProduct = require("../components/ReturnOrderProduct");


const db = DatabaseConnection.getInstance();

exports.selectReturnOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ReturnOrder;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new ReturnOrder(r.returnOrderId, r.returnDate, r.restockOrderId)));
            }
        });
    });
}

exports.selectReturnOrderByID = (returnOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ReturnOrder WHERE returnOrderId = ?;`;
        db.get(sql, [returnOrderId], (err, row) => {
            if (err) {
                reject(err.toString());
            } else {
                if (row) {
                    resolve(new ReturnOrder(row.returnOrderId, row.returnDate, row.restockOrderId));
                } else {
                    resolve(null);
                }
            }
        });
    });
}

exports.insertReturnOrder = (returnOrder) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO ReturnOrder(returnDate, restockOrderId) VALUES (?, ?);`;
        db.run(sql, [returnOrder.returnDate, returnOrder.restockOrderId], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        })
    });
}

exports.deleteReturnOrder = (returnOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM ReturnOrder WHERE returnOrderId = ?`;
        db.run(sql, [returnOrderId], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}


exports.selectReturnOrderProducts = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ReturnOrderProduct;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new ReturnOrderProduct(r.returnOrderId, r.ITEMID, r.price)));
            }
        });
    });
}

exports.selectReturnOrderProductByID = (returnOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ReturnOrderProduct WHERE returnOrderId = ?;`;
        db.all(sql, [returnOrderId], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new ReturnOrderProduct(r.returnOrderId, r.ITEMID, r.price)));
            }
        });
    });
}

exports.insertReturnOrderProduct = (ReturnOrderProduct) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO ReturnOrderProduct(returnOrderId, ITEMID, price) VALUES (?, ?, ?);`;
        db.run(sql, [ReturnOrderProduct.returnOrderId, ReturnOrderProduct.ITEMID, ReturnOrderProduct.price], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        })
    });
}

exports.deleteReturnOrderProduct = (returnOrderId, ITEMID) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM ReturnOrderProduct WHERE returnOrderId = ?`;
        db.run(sql, [returnOrderId, ITEMID], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.updateReturnOrderProduct = (returnOrderProduct) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE ReturnOrderProduct SET price = ? WHERE returnOrderId = ? AND ITEMID = ?`;
        db.run(sql, [returnOrderProduct.price, returnOrderProduct.returnOrderId, returnOrderProduct.ITEMID], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}
