const DatabaseConnection = require("./DatabaseConnection");
const {InternalOrder} = require("../components/InternalOrder");


const db = DatabaseConnection.getInstance();

const selectProductsIntoInternalOrder = (internalOrder) => {
	return new Promise((resolve, reject) => {
		// propagate internalOrder null
		if (!internalOrder) resolve(null);

		const sql = `SELECT * FROM InternalOrderProduct, Item WHERE InternalOrderProduct.skuid = Item.SKUID AND ioid = ?;`;
		db.all(sql, [internalOrder.id], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				internalOrder.products = rows.map((iop) => ({SKUId: iop.skuid, description: iop.description, price: iop.price, qty: iop.quantity || undefined, RFID: iop.rfid || undefined}));
				resolve(internalOrder);
			}
		});
	});
}

exports.selectInternalOrders = () => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM InternalOrder;`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((io) => new InternalOrder(io.id, io.issueDate, io.state, io.customerId, null)));
			}
		});
	}).then((internalOrders) => Promise.all(internalOrders.map((io) => selectProductsIntoInternalOrder(io))));
}

exports.selectInternalOrdersByState = (state) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM InternalOrder WHERE state = ?;`;
		db.all(sql, [state], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((io) => new InternalOrder(io.id, io.issueDate, io.state, io.customerId, null)));
			}
		});
	}).then((internalOrders) => Promise.all(internalOrders.map((io) => selectProductsIntoInternalOrder(io))));
}

exports.selectInternalOrderByID = (id) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM InternalOrder WHERE id = ?;`;
		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err.toString());
			} else {
				if (row) {
					resolve(new InternalOrder(row.id, row.issueDate, row.state, row.customerId, null));
				} else {
					resolve(null);
				}
			}
		});
	}).then((internalOrder) => selectProductsIntoInternalOrder(internalOrder));
}

exports.insertInternalOrder = (internalOrder) => {
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO InternalOrder(issueDate, state, customerId) VALUES (?, ?, ?);`;
		db.run(sql, [internalOrder.issueDate, internalOrder.state, internalOrder.customerId], function (err) {
			if (err) {
				reject(err.toString());
			} else {
				internalOrder.id = this.lastID;
				resolve();
			}
		})
	}).then(() => Promise.all(internalOrder.products.map((p) => new Promise((resolve, reject) => {
		// create a promise for each InternalOrderProduct insertion
		const sql = `INSERT INTO InternalOrderProduct(ioid, skuid, quantity, rfid) VALUES (?, ?, ?, ?);`;
		db.run(sql, [internalOrder.id, p.SKUId, p.qty, null], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}))));
}

exports.updateInternalOrder = (internalOrder) => {
	return new Promise((resolve, reject) => {
		const sql = `UPDATE InternalOrder SET
			issueDate = ?, state = ?, customerId = ?
			WHERE id = ?`;
		db.run(sql, [internalOrder.issueDate, internalOrder.state, internalOrder.customerId, internalOrder.id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	});
}

exports.updateInternalOrderProducts = (internalOrder) => {
	return Promise.all(internalOrder.products.map((p) => new Promise((resolve, reject) => {
		const sql = `DELETE FROM InternalOrderProduct WHERE ioid = ? AND skuid = ? AND rfid IS NULL;`;
		db.run(sql, [internalOrder.id, p.SKUId], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}))).then(() => Promise.all(internalOrder.products.map((p) =>  new Promise((resolve, reject) => {
		const sql = `INSERT INTO InternalOrderProduct(ioid, skuid, quantity, rfid) VALUES (?, ?, ?, ?);`;
		db.run(sql, [internalOrder.id, p.SKUId, null, p.RFID], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}))));
}

exports.deleteInternalOrder = (id) => {
	return new Promise((resolve, reject) => {
		// delete return order from InternalOrderProduct
		const sql = `DELETE FROM InternalOrderProduct WHERE ioid = ?`;
		db.run(sql, [id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}).then(() => new Promise((resolve, reject) => {
		// delete return order from InternalOrder
		const sql = `DELETE FROM InternalOrder WHERE id = ?`;
		db.run(sql, [id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}));
}

exports.deleteInternalOrderData = () => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE * FROM InternalOrder`;
        db.run(sql, [], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(true);
            }
        });
    });
}
