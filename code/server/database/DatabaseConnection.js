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
			SKUID varchar(12) NOT NULL,
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
			occupiedValue integer DEFAULT 0,
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
			ITEMID varchar(12) NOT NULL,
			description varchar(100) NOT NULL,
			price double NOT NULL,
			SKUID varchar(12) NOT NULL,
			supplierID varchar(12) NOT NULL,
    		PRIMARY KEY (ITEMID)
		);`;
		this.db.run(createTableItem, (err) => err && console.log(err));

		/** Restock Order */
		const createTableRestockOrder = `CREATE TABLE IF NOT EXISTS RestockOrder (
			ROID INTEGER NOT NULL,
			issueDate DATETIME NOT NULL,
			state varchar(10) NOT NULL,
			supplierID INTEGER NOT NULL,
			transportNote varchar(12) NOT NULL,
			skuItems varchar(50) NOT NULL,
    		PRIMARY KEY (ROID)
		);`;
		this.db.run(createTableRestockOrder, (err) => err && console.log(err));

		/** Restock Order & Item */
		const createTableRestockOrderProducts = `CREATE TABLE IF NOT EXISTS ROProducts (
			ROID integer NOT NULL,
			ITEMID varchar(12) NOT NULL,
			quantity integer NOT NULL,
    		PRIMARY KEY (ROID, ITEMID)
		);`;
		this.db.run(createTableRestockOrderProducts, (err) => err && console.log(err));

		/** Return Order **/
		const createTableReturnOrder = `CREATE TABLE IF NOT EXISTS ReturnOrder (
			returnOrderId INTEGER NOT NULL,
			returnDate DATETIME NOT NULL,
			restockOrderId INTEGER NOT NULL,
				PRIMARY KEY (returnOrderId)
		);`;
		this.db.run(createTableReturnOrder, (err) => err && console.log(err));

		/** Return Order & Item */
		const createTableReturnOrderProduct = `CREATE TABLE IF NOT EXISTS ReturnOrderProduct (
			returnOrderId integer NOT NULL,
			ITEMID varchar(12) NOT NULL,
			price double NOT NULL,
				PRIMARY KEY (returnOrderId, ITEMID)
		);`;
		this.db.run(createTableReturnOrderProduct, (err) => err && console.log(err));

		/** Internal Order **/
		const createTableInternalOrder = `CREATE TABLE IF NOT EXISTS InternalOrder (
			internalOrderId INTEGER NOT NULL,
			issueDate DATETIME NOT NULL,
			state VARCHAR(10) NOT NULL,
			customerId INTEGER NOT NULL,
			PRIMARY KEY (internalOrderId)
		);`;
		this.db.run(createTableInternalOrder, (err) => err && console.log(err));

		/** Internal Order & Item */
		const createTableInternalOrderProduct = `CREATE TABLE IF NOT EXISTS InternalOrderProduct (
			internalOrderId integer NOT NULL,
			ITEMID varchar(12) NOT NULL,
			quantity integer NOT NULL,
    		PRIMARY KEY (internalOrderId, ITEMID)
		);`;
		this.db.run(createTableInternalOrderProduct, (err) => err && console.log(err));
	}
}

module.exports = DatabaseConnection
