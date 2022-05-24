const sqlite3 = require("sqlite3");


class DatabaseConnection {
	static db = null;

	static getInstance() {
		if (!this.db) {
			this.db = new sqlite3.Database("./database/ezwh.db", (err) => err && console.log(err));
			this.createTables();
		}
		return this.db;
	}

	static createTables() {
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
		this.db.run(createTableSKU, (err) => err && console.log(err));

		/** SKU Item **/
		const createTableSKUItem = `CREATE TABLE IF NOT EXISTS SKUItem (
			RFID varchar(50) NOT NULL,
			SKUID INTEGER NOT NULL,
			available boolean DEFAULT 0,
			dateOfStock DATETIME,
			PRIMARY KEY (RFID)
		);`;
		this.db.run(createTableSKUItem, (err) => err && console.log(err));

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
		this.db.run(createTablePosition, (err) => err && console.log(err));

		/** Test Descriptor **/
		const createTableTestDescriptor = `CREATE TABLE IF NOT EXISTS TestDescriptor (
			id INTEGER NOT NULL,
			name VARCHAR(64) NOT NULL,
			procedureDescription VARCHAR(512) NOT NULL,
			idSKU INTEGER NOT NULL,
			PRIMARY KEY (id)
		);`;
		this.db.run(createTableTestDescriptor, (err) => err && console.log(err));

		/** Test Result **/
		const createTableTestResult = `CREATE TABLE IF NOT EXISTS TestResult (
			id INTEGER NOT NULL,
			idTestDescriptor INTEGER NOT NULL,
			date VARCHAR(16) NOT NULL,
			result INTEGER NOT NULL,
			rfid VARCHAR(32) NOT NULL,
			PRIMARY KEY (id)
		)`;
		this.db.run(createTableTestResult, (err) => err && console.log(err));

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
		this.db.run(createTableUser, (err) => err && console.log(err));

		/** Item **/
		const createTableItem = `CREATE TABLE IF NOT EXISTS Item (
			id varchar(12) NOT NULL,
			description varchar(100) NOT NULL,
			price double NOT NULL,
			SKUID INTEGER NOT NULL,
			supplierId varchar(12) NOT NULL,
			PRIMARY KEY (id)
		);`;
		this.db.run(createTableItem, (err) => err && console.log(err));

		/** Restock Order */
		const createTableRestockOrder = `CREATE TABLE IF NOT EXISTS RestockOrder (
			id INTEGER NOT NULL,
			issueDate VARCHAR(32) NOT NULL,
			state VARCHAR(16) NOT NULL,
			supplierId INTEGER NOT NULL,
			deliveryDate VARCHAR(16),
			PRIMARY KEY (id)
		);`;
		this.db.run(createTableRestockOrder, (err) => err && console.log(err));

		/** Restock Order & Item */
		const createTableRestockOrderProduct = `CREATE TABLE IF NOT EXISTS RestockOrderProduct (
			roid INTEGER NOT NULL,
			skuid INTEGER NOT NULL,
			quantity INTEGER NOT NULL,
			PRIMARY KEY (roid, skuid)
		);`;
		this.db.run(createTableRestockOrderProduct, (err) => err && console.log(err));

		/** Restock Order & SKU Items **/
		const createTableRestockOrderSKUItem = `CREATE TABLE IF NOT EXISTS RestockOrderSKUItem (
			roid INTEGER NOT NULL,
			skuid INTEGER NOT NULL,
			rfid VARCHAR(32) NOT NULL,
			PRIMARY KEY (roid, skuid, rfid)
		);`;
		this.db.run(createTableRestockOrderSKUItem, (err) => err && console.log(err));

		/** Return Order **/
		const createTableReturnOrder = `CREATE TABLE IF NOT EXISTS ReturnOrder (
			id INTEGER NOT NULL,
			returnDate DATETIME NOT NULL,
			restockOrderId INTEGER NOT NULL,
			PRIMARY KEY (id)
		);`;
		this.db.run(createTableReturnOrder, (err) => err && console.log(err));

		/** Return Order & Item */
		const createTableReturnOrderProduct = `CREATE TABLE IF NOT EXISTS ReturnOrderProduct (
			reoid integer NOT NULL,
			skuid INTEGER NOT NULL,
			rfid VARCHAR(32),
			PRIMARY KEY (reoid, skuid)
		);`;
		this.db.run(createTableReturnOrderProduct, (err) => err && console.log(err));

		/** Internal Order **/
		const createTableInternalOrder = `CREATE TABLE IF NOT EXISTS InternalOrder (
			id INTEGER NOT NULL,
			issueDate DATETIME NOT NULL,
			state VARCHAR(16) NOT NULL,
			customerId INTEGER NOT NULL,
			PRIMARY KEY (id)
		);`;
		this.db.run(createTableInternalOrder, (err) => err && console.log(err));

		/** Internal Order & Item */
		const createTableInternalOrderProduct = `CREATE TABLE IF NOT EXISTS InternalOrderProduct (
			ioid INTEGER NOT NULL,
			skuid INTEGER NOT NULL,
			quantity integer,
			rfid varchar(32),
			PRIMARY KEY (ioid, skuid, rfid)
		);`;
		this.db.run(createTableInternalOrderProduct, (err) => err && console.log(err));
	}

	static resetTable(tableName) {
		return new Promise((resolve, reject) => {
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
		});
	}

	static resetAllTables() {
		const users = [
			["John", "Smith", "user1@ezwh.com", "NyXsQCTQ+OaylB+Yi0mnlvhaelX2LqqfBwZ0A80QkNM=", "ELXfvDBtTWOcoN7my2w+T/HDXbyGJ3cVUWOHlWD3V4Y=", "customer"],
			["Creed", "Bratton", "qualityEmployee1@ezwh.com", "jv6wZwuthjVVug0U4YYEKEEB5CKiZHftNIqPRcAOazA=", "+U3SJooCydj+o7rTf0MuVtVknWvQoxKqbtu84WvIkUw=", "qualityEmployee"],
			["Dwight", "Schrute", "clerk1@ezwh.com", "TVy3LwcC6XQd+9OKRh2DmtAOHJsc1sdzcAMCIl4pK34=", "BkRa36JqhekN3VZNddj/MhRr3NbEeGSY97xPgpXuSFA=", "clerk"],
			["Darryl", "Philbin", "deliveryEmployee1@ezwh.com", "B/BoESakTY2XTDk67bCz1dqSkD4hA/jm6eeUFsfsHKY=", "GFLU2eSrwPzb8UeA/+cATlgfMk4gxSbHIVjfiBW0jHE=", "deliveryEmployee"],
			["Dunder", "Mifflin", "supplier1@ezwh.com", "1WSthO+irk3Va4fkGZP89o2R1/2FDzjTg21KRsIXmOM=", "qeNoimJcUht36I6c447WTDtYzKagKFzemVbVlmBXRno=", "supplier"],
		];

		return Promise.all(["InternalOrder", "InternalOrderProduct", "Item", "Position", "RestockOrder",
			"RestockOrderProduct", "RestockOrderSKUItem", "ReturnOrder", "ReturnOrderProduct", "SKU", "SKUItem",
			"TestDescriptor", "TestResult", "User"].map((t) => this.resetTable(t)))
			.then(() => Promise.all(users.map((u) => new Promise((resolve, reject) => {
				const sql = `INSERT INTO User(name, surname, email, passwordHash, passwordSalt, type) VALUES (?, ?, ?, ?, ?, ?);`;
				this.db.run(sql, u, (err) => {
					if (err) {
						console.log(`error while inserting user ${u}`);
						console.log(err);
						reject(err);
					} else {
						resolve();
					}
				});
			}))));
	}
}

module.exports = DatabaseConnection
