const sqlite3 = require("sqlite3");


class DatabaseConnection {
	static db = null;

	static createConnection() {
		/** SKU **/
		const createTableSKU = `CREATE TABLE IF NOT EXISTS SKU (
			SKUID INTEGER NOT NULL,
			description varchar(100) NOT NULL,
			weight double NOT NULL,
			volume double NOT NULL,
			price double NOT NULL,
			notes varchar(50) NOT NULL,
			positionId varchar(12),
			availableQuantity integer NOT NULL,
			PRIMARY KEY (SKUID)
		);`;

		/** SKU Item **/
		const createTableSKUItem = `CREATE TABLE IF NOT EXISTS SKUItem (
			RFID varchar(50) NOT NULL,
			SKUID INTEGER NOT NULL,
			available boolean DEFAULT 0,
			dateOfStock DATETIME,
			PRIMARY KEY (RFID)
		);`;

		/** Position **/
		const createTablePosition = `CREATE TABLE IF NOT EXISTS Position (
			posID varchar(12) NOT NULL,
			aisleID varchar(4) NOT NULL,
			row varchar(4) NOT NULL,
			col varchar(4) NOT NULL,
			maxWeight integer NOT NULL,
			maxVolume integer NOT NULL,
			occupiedWeight integer DEFAULT 0,
			occupiedVolume integer DEFAULT 0,
			PRIMARY KEY(posID)
		);`;

		/** Test Descriptor **/
		const createTableTestDescriptor = `CREATE TABLE IF NOT EXISTS TestDescriptor (
			id INTEGER NOT NULL,
			name VARCHAR(64) NOT NULL,
			procedureDescription VARCHAR(512) NOT NULL,
			idSKU INTEGER NOT NULL,
			PRIMARY KEY (id)
		);`;

		/** Test Result **/
		const createTableTestResult = `CREATE TABLE IF NOT EXISTS TestResult (
			id INTEGER NOT NULL,
			idTestDescriptor INTEGER NOT NULL,
			date VARCHAR(16) NOT NULL,
			result INTEGER NOT NULL,
			rfid VARCHAR(32) NOT NULL,
			PRIMARY KEY (id)
		)`;

		/** User **/
		const createTableUser = `CREATE TABLE IF NOT EXISTS User (
			id INTEGER NOT NULL,
			name VARCHAR(64) NOT NULL,
			surname VARCHAR(64) NOT NULL,
			email VARCHAR(128) NOT NULL,
			passwordHash VARCHAR(128) NOT NULL,
			passwordSalt VARCHAR(128) NOT NULL,
			type VARCHAR(32) NOT NULL,
			PRIMARY KEY (id)
		);`;

		/** Item **/
		const createTableItem = `CREATE TABLE IF NOT EXISTS Item (
			id INTEGER NOT NULL,
			description varchar(100) NOT NULL,
			price double NOT NULL,
			SKUID INTEGER NOT NULL,
			supplierId INTEGER NOT NULL,
			PRIMARY KEY (id, supplierId)
		);`;

		/** Restock Order */
		const createTableRestockOrder = `CREATE TABLE IF NOT EXISTS RestockOrder (
			id INTEGER NOT NULL,
			issueDate VARCHAR(32) NOT NULL,
			state VARCHAR(16) NOT NULL,
			supplierId INTEGER NOT NULL,
			deliveryDate VARCHAR(16),
			PRIMARY KEY (id)
		);`;

		/** Restock Order & Item */
		const createTableRestockOrderProduct = `CREATE TABLE IF NOT EXISTS RestockOrderProduct (
			roid INTEGER NOT NULL,
			skuid INTEGER NOT NULL,
			quantity INTEGER NOT NULL,
			PRIMARY KEY (roid, skuid)
		);`;

		/** Restock Order & SKU Items **/
		const createTableRestockOrderSKUItem = `CREATE TABLE IF NOT EXISTS RestockOrderSKUItem (
			roid INTEGER NOT NULL,
			skuid INTEGER NOT NULL,
			rfid VARCHAR(32) NOT NULL,
			PRIMARY KEY (roid, skuid, rfid)
		);`;

		/** Return Order **/
		const createTableReturnOrder = `CREATE TABLE IF NOT EXISTS ReturnOrder (
			id INTEGER NOT NULL,
			returnDate DATETIME NOT NULL,
			restockOrderId INTEGER NOT NULL,
			PRIMARY KEY (id)
		);`;

		/** Return Order & Item */
		const createTableReturnOrderProduct = `CREATE TABLE IF NOT EXISTS ReturnOrderProduct (
			reoid integer NOT NULL,
			skuid INTEGER NOT NULL,
			rfid VARCHAR(32),
			PRIMARY KEY (reoid, skuid)
		);`;

		/** Internal Order **/
		const createTableInternalOrder = `CREATE TABLE IF NOT EXISTS InternalOrder (
			id INTEGER NOT NULL,
			issueDate DATETIME NOT NULL,
			state VARCHAR(16) NOT NULL,
			customerId INTEGER NOT NULL,
			PRIMARY KEY (id)
		);`;

		/** Internal Order & Item */
		const createTableInternalOrderProduct = `CREATE TABLE IF NOT EXISTS InternalOrderProduct (
			ioid INTEGER NOT NULL,
			skuid INTEGER NOT NULL,
			quantity integer,
			rfid varchar(32),
			PRIMARY KEY (ioid, skuid, rfid)
		);`;

		return new Promise((resolve, reject) => {
			this.db = new sqlite3.Database("./database/ezwh.db", (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		}).then(() => Promise.all([createTableSKU, createTableSKUItem, createTablePosition, createTableTestDescriptor,
			createTableTestResult, createTableUser, createTableItem, createTableRestockOrder,
			createTableRestockOrderProduct, createTableRestockOrderSKUItem, createTableReturnOrder,
			createTableReturnOrderProduct, createTableInternalOrder, createTableInternalOrderProduct]
			.map((sql) => new Promise((resolve, reject) => {
				this.db.run(sql, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
		}))));
	}

	static resetAllTables() {
		return Promise.all(["InternalOrder", "InternalOrderProduct", "Item", "Position", "RestockOrder",
			"RestockOrderProduct", "RestockOrderSKUItem", "ReturnOrder", "ReturnOrderProduct", "SKU", "SKUItem",
			"TestDescriptor", "TestResult", "User"].map((tableName) => new Promise((resolve, reject) => {
			const sql = `DELETE FROM ${tableName};`;
			this.db.run(sql, [], (err) => {
				if (err) {
					console.log(`error while clearing table ${tableName}`);
					console.log(err);
					reject(err);
				} else {
					resolve();
				}
			});
		})));
	}

	static createDefaultUsers() {
		const users = [
			["John", "Smith", "user1@ezwh.com", "NyXsQCTQ+OaylB+Yi0mnlvhaelX2LqqfBwZ0A80QkNM=", "ELXfvDBtTWOcoN7my2w+T/HDXbyGJ3cVUWOHlWD3V4Y=", "customer"],
			["Creed", "Bratton", "qualityEmployee1@ezwh.com", "jv6wZwuthjVVug0U4YYEKEEB5CKiZHftNIqPRcAOazA=", "+U3SJooCydj+o7rTf0MuVtVknWvQoxKqbtu84WvIkUw=", "qualityEmployee"],
			["Dwight", "Schrute", "clerk1@ezwh.com", "TVy3LwcC6XQd+9OKRh2DmtAOHJsc1sdzcAMCIl4pK34=", "BkRa36JqhekN3VZNddj/MhRr3NbEeGSY97xPgpXuSFA=", "clerk"],
			["Darryl", "Philbin", "deliveryEmployee1@ezwh.com", "B/BoESakTY2XTDk67bCz1dqSkD4hA/jm6eeUFsfsHKY=", "GFLU2eSrwPzb8UeA/+cATlgfMk4gxSbHIVjfiBW0jHE=", "deliveryEmployee"],
			["Dunder", "Mifflin", "supplier1@ezwh.com", "1WSthO+irk3Va4fkGZP89o2R1/2FDzjTg21KRsIXmOM=", "qeNoimJcUht36I6c447WTDtYzKagKFzemVbVlmBXRno=", "supplier"],
			["Mana", "Ger", "manager1@ezwh.com", "n/BvDaH5PnbquWV2yOLONE7pa07uD0+Dxj4W0C67n+c=", "h/rqGUKuEBaSa7Es1UfRzjfIwq7UmiOPpXSw9ol27Xs=", "manager"]
		];

		return Promise.all(users.map((u) => new Promise((resolve, reject) => {
			const sql = `INSERT INTO User(name, surname, email, passwordHash, passwordSalt, type) VALUES (?, ?, ?, ?, ?, ?);`;
			this.db.run(sql, u, () => resolve());
		})));
	}
}

module.exports = DatabaseConnection
