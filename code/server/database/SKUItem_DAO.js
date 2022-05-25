const DatabaseConnection = require("./DatabaseConnection");
const SKUItem = require("../components/SKUItem");


const db = DatabaseConnection.getInstance();

exports.selectSKUItems = () => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM SKUItem;`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((row) => new SKUItem(row.RFID, row.SKUID, row.available, row.dateOfStock)));
			}
		});
	});
}

exports.selectSKUItemByRFID = (rfid) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM SKUItem WHERE RFID = ?;`;
		db.get(sql, [rfid], (err, row) => {
			if (err) {
				reject(err.toString());
			} else {
				if (row) {
					resolve(new SKUItem(row.RFID, row.SKUID, row.available, row.dateOfStock));
				} else {
					resolve(null);
				}
			}
		});
	});
}

exports.selectSKUItemBySKUID = (skuid) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM SKUItem WHERE SKUID = ? AND available = ?;`;
		db.all(sql, [skuid, 1], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((row) => new SKUItem(row.RFID, row.SKUID, row.available, row.dateOfStock)));
			}
		});
	});
}

exports.insertSKUItem = (newSKUItem) => {
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO SKUItem(RFID, SKUID, available, dateOfStock)
						 VALUES(?, ?, ?, ?);`;
		db.run(sql, [newSKUItem.getRFID(), newSKUItem.getSKUId(), newSKUItem.getAvailable(), newSKUItem.getDateOfStock()], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		})
	});
}

exports.updateSKUItem = (rfid, newSKUItem) => {
	return new Promise((resolve, reject) => {
		const sql = `UPDATE SKUItem
					 SET RFID = ?, available = ?, dateOfStock = ?
					 WHERE RFID=?;`;
		db.run(sql, [newSKUItem.getRFID(), newSKUItem.getAvailable(), newSKUItem.getDateOfStock(), rfid], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	});
}

exports.deleteSKUItem = (RFID) => {
	return new Promise((resolve, reject) => {
		const sql = `DELETE FROM SKUItem WHERE RFID=?;`;
		db.run(sql, [RFID], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	});
}
