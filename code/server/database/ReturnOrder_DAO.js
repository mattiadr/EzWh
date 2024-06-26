const DatabaseConnection = require("./DatabaseConnection");
const ReturnOrder = require("../components/ReturnOrder");


const selectProductsIntoReturnOrder = (returnOrder) => {
	return new Promise((resolve, reject) => {
		// propagate returnOrder null
		if (!returnOrder) resolve(null);

		const sql = `SELECT ReturnOrderProduct.skuid, Item.id, description, price, rfid FROM ReturnOrderProduct, Item WHERE ReturnOrderProduct.skuid = Item.SKUID AND reoid = ?;`;
		DatabaseConnection.db.all(sql, [returnOrder.id], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				returnOrder.products = rows.map((reop) => ({SKUId: reop.skuid, itemId: reop.id, description: reop.description, price: reop.price, RFID: reop.rfid || undefined}));
				resolve(returnOrder);
			}
		});
	});
}

exports.selectReturnOrders = () => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM ReturnOrder;`;
		DatabaseConnection.db.all(sql, [], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((r) => new ReturnOrder(r.id, r.returnDate, r.restockOrderId)));
			}
		});
	}).then((restockOrders) => Promise.all(restockOrders.map((reo) => selectProductsIntoReturnOrder(reo))));
}

exports.selectReturnOrderByID = (returnOrderId) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM ReturnOrder WHERE id = ?;`;
		DatabaseConnection.db.get(sql, [returnOrderId], (err, row) => {
			if (err) {
				reject(err.toString());
			} else {
				if (row) {
					resolve(new ReturnOrder(row.id, row.returnDate, row.restockOrderId));
				} else {
					resolve(null);
				}
			}
		});
	}).then((returnOrder) => selectProductsIntoReturnOrder(returnOrder));
}

exports.insertReturnOrder = (returnOrder) => {
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO ReturnOrder(returnDate, restockOrderId) VALUES (?, ?);`;
		DatabaseConnection.db.run(sql, [returnOrder.returnDate, returnOrder.restockOrderId], function (err) {
			if (err) {
				reject(err.toString());
			} else {
				returnOrder.id = this.lastID;
				resolve();
			}
		});
	}).then(() => Promise.all(returnOrder.products.map((p) => new Promise((resolve, reject) => {
		// create a promise for each ReturnOrderProduct insertion
		const sql = `INSERT INTO ReturnOrderProduct(reoid, skuid, rfid) VALUES (?, ?, ?);`;
		DatabaseConnection.db.run(sql, [returnOrder.id, p.SKUId, p.RFID], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}))));
}

exports.deleteReturnOrder = (returnOrderId) => {
	return new Promise((resolve, reject) => {
		// delete return order from ReturnOrderProduct
		const sql = `DELETE FROM ReturnOrderProduct WHERE reoid = ?`;
		DatabaseConnection.db.run(sql, [returnOrderId], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}).then(() => new Promise((resolve, reject) => {
		// delete return order from ReturnOrder
		const sql = `DELETE FROM ReturnOrder WHERE id = ?`;
		DatabaseConnection.db.run(sql, [returnOrderId], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}));
}

/** used for testing **/
exports.deleteReturnOrderData = () => {
	return new Promise((resolve, reject) => {
		// delete return order from ReturnOrderProduct
		const sql = `DELETE FROM ReturnOrderProduct;`;
		DatabaseConnection.db.run(sql, [], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}).then(() => new Promise((resolve, reject) => {
		// delete return order from ReturnOrder
		const sql = `DELETE FROM ReturnOrder;`;
		DatabaseConnection.db.run(sql, [], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	}));
}
