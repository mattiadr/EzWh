const DatabaseConnection = require("./DatabaseConnection");
const {RestockOrder} = require("../components/RestockOrder");


const db = DatabaseConnection.getInstance();

const selectProductsIntoRestockOrder = (restockOrder) => {
	return new Promise(((resolve, reject) => {
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
	}));
}

exports.selectRestockOrders = () => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM RestockOrder;`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((ro) => new RestockOrder(ro.id, ro.issueDate, ro.state, ro.supplierId)));
			}
		});
	}).then((restockOrders) => Promise.all(restockOrders.map((ro) => selectProductsIntoRestockOrder(ro))));
}

exports.selectRestockOrdersByState = (state) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM RestockOrder WHERE state = ?;`;
		db.all(sql, [state], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((ro) => new RestockOrder(ro.id, ro.issueDate, ro.state, ro.supplierId)));
			}
		});
	}).then((restockOrders) => Promise.all(restockOrders.map((ro) => selectProductsIntoRestockOrder(ro))));
}

exports.selectRestockOrderByID = (id) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM RestockOrder WHERE id = ?;`;
		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err.toString());
			} else {
				if (row) {
					resolve(new RestockOrder(row.id, row.issueDate, row.state, row.supplierId));
				} else {
					resolve(null);
				}
			}
		});
	}).then((restockOrder) => selectProductsIntoRestockOrder(restockOrder));
}

exports.insertRestockOrder = (restockOrder) => {
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO RestockOrder(issueDate, state, supplierID) VALUES (?, ?, ?);`;
		db.run(sql, [restockOrder.issueDate, restockOrder.state, restockOrder.supplierID], function (err) {
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

// TODO everything below this
exports.updateRestockOrder = (restockOrder) => {
	return new Promise((resolve, reject) => {
		const sql = `UPDATE RestockOrder SET
                                             issueDate = ?, state = ?, supplierId = ?, transportNote = ?
                     WHERE ROID = ?`;
		db.run(sql, [restockOrder.issueDate, restockOrder.state, restockOrder.products, restockOrder.supplierId, restockOrder.transportNote], (err) => {
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

exports.selectProducts = (roid) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT skuItems FROM RestockOrder WHERE ROID = ?`;
		const ro = this.selectRestockOrderByID(roid)
		db.all(sql,
			[ro.forEach(x => x.getSKUItems()
				.filter(v => {
					return v.getTestResults().filter(w => w.getResult() === false).count() > 0;
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
