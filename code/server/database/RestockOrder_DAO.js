const DatabaseConnection = require("./DatabaseConnection");
const {RestockOrder} = require("../components/RestockOrder");


const db = DatabaseConnection.getInstance();

const selectProductsIntoRestockOrder = (restockOrder) => {
	return new Promise((resolve, reject) => {
		// propagate restockOrder null
		if (!restockOrder) resolve(null);

		const sql = `SELECT RestockOrderProduct.skuid, description, price, quantity FROM RestockOrderProduct, Item WHERE RestockOrderProduct.skuid = Item.SKUID AND roid = ?;`;
		db.all(sql, [restockOrder.id], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				restockOrder.products = rows.map((rop) => ({SKUId: rop.skuid, description: rop.description, price: rop.price, qty: rop.quantity}));
				resolve(restockOrder);
			}
		});
	});
}

const selectSKUItemsIntoRestockOrder = (restockOrder) => {
	return new Promise((resolve, reject) => {
		// propagate restockOrder null
		if (!restockOrder) resolve(null);

		const sql = `SELECT * FROM RestockOrderSKUItem WHERE roid = ?;`;
		db.all(sql, [restockOrder.id], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				restockOrder.addSKUItems(rows.map((r) => ({SKUId: r.skuid, rfid: r.rfid})));
				resolve(restockOrder);
			}
		});
	});
}

exports.selectRestockOrders = () => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM RestockOrder;`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((ro) => new RestockOrder(ro.id, ro.issueDate, ro.state, ro.supplierId, ro.deliveryDate, null)));
			}
		});
	}).then((restockOrders) => Promise.all(restockOrders.map((ro) => selectProductsIntoRestockOrder(ro))))
		.then((restockOrders) => Promise.all(restockOrders.map((ro) => selectSKUItemsIntoRestockOrder(ro))));
}

exports.selectRestockOrdersByState = (state) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM RestockOrder WHERE state = ?;`;
		db.all(sql, [state], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((ro) => new RestockOrder(ro.id, ro.issueDate, ro.state, ro.supplierId, ro.deliveryDate, null)));
			}
		});
	}).then((restockOrders) => Promise.all(restockOrders.map((ro) => selectProductsIntoRestockOrder(ro))))
		.then((restockOrders) => Promise.all(restockOrders.map((ro) => selectSKUItemsIntoRestockOrder(ro))));
}

exports.selectRestockOrderByID = (id) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM RestockOrder WHERE id = ?;`;
		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err.toString());
			} else {
				if (row) {
					resolve(new RestockOrder(row.id, row.issueDate, row.state, row.supplierId, row.deliveryDate, null));
				} else {
					resolve(null);
				}
			}
		});
	}).then((restockOrder) => selectProductsIntoRestockOrder(restockOrder))
		.then((restockOrder) => selectSKUItemsIntoRestockOrder(restockOrder));
}

exports.selectRestockOrderByIDReturnItems = (id) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT skuid, RestockOrderSKUItem.rfid FROM RestockOrderSKUItem, TestResult
			WHERE RestockOrderSKUItem.rfid = TestResult.rfid AND roid = ? AND result = ?
			GROUP BY skuid, RestockOrderSKUItem.rfid;`;
		db.all(sql, [id, false], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((r) => ({SKUId: r.skuid, rfid: r.rfid})));
			}
		});
	});
}

exports.insertRestockOrder = (restockOrder) => {
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO RestockOrder(issueDate, state, supplierId) VALUES (?, ?, ?);`;
		db.run(sql, [restockOrder.issueDate, restockOrder.state, restockOrder.supplierId], function (err) {
			if (err) {
				reject(err.toString());
			} else {
				restockOrder.id = this.lastID;
				resolve();
			}
		});
	}).then(() => Promise.all(restockOrder.products.map((p) => new Promise((resolve, reject) => {
		// create a promise for each RestockOrderProduct insertion
		const sql = `INSERT INTO RestockOrderProduct(roid, skuid, quantity) VALUES (?, ?, ?);`;
		db.run(sql, [restockOrder.id, p.SKUId, p.qty], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}))));
}

exports.insertRestockOrderSKUItems = (roid, skuItems) => {
	return Promise.all(skuItems.map((skuItem) => new Promise(((resolve, reject) => {
		const sql = `INSERT INTO RestockOrderSKUItem(roid, skuid, rfid) VALUES (?, ?, ?);`;
		db.run(sql, [roid, skuItem.SKUId, skuItem.rfid], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}))));
}

exports.updateRestockOrder = (restockOrder) => {
	return new Promise((resolve, reject) => {
		const sql = `UPDATE RestockOrder SET
			issueDate = ?, state = ?, supplierId = ?, deliveryDate = ?
			WHERE id = ?;`;
		db.run(sql, [restockOrder.issueDate, restockOrder.state, restockOrder.supplierId, restockOrder.deliveryDate, restockOrder.id], (err) => {
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
		// delete restock order from RestockOrderProduct
		const sql = `DELETE FROM RestockOrderProduct WHERE roid = ?;`;
		db.run(sql, [id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}).then(() => new Promise((resolve, reject) => {
		// delete restock order from RestockOrderSKUItem
		const sql = `DELETE FROM RestockOrderSKUItem WHERE roid = ?;`;
		db.run(sql, [id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	})).then(() => new Promise((resolve, reject) => {
		// delete restock order from RestockOrder
		const sql = `DELETE FROM RestockOrder WHERE id = ?;`;
		db.run(sql, [id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}));
}

exports.deleteRestockOrderData = () => {
	return new Promise((resolve, reject) => {
		// delete restock order from RestockOrderProduct
		const sql = `DELETE FROM RestockOrderProduct;`;
		db.run(sql, [], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}).then(() => new Promise((resolve, reject) => {
		// delete restock order from RestockOrderSKUItem
		const sql = `DELETE FROM RestockOrderSKUItem;`;
		db.run(sql, [], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	})).then(() => new Promise((resolve, reject) => {
		// delete restock order from RestockOrder
		const sql = `DELETE FROM RestockOrder;`;
		db.run(sql, [], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}));
}
