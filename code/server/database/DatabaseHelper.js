const sqlite3 = require("sqlite3");

const SKU = require("../components/SKU");
const SKUItem = require("../components/SKUItem");
const Position = require("../components/Position");
const Item = require("../components/Item");
const RestockOrder = require("../components/RestockOrder");
const {User} = require("../components/User");
const {TestDescriptor} = require("../components/TestDescriptor");
const {TestResult} = require("../components/TestResult");
const ReturnOrder = require("../components/ReturnOrder");
const InternalOrder = require("../components/InternalOrder")
const ReturnOrderProduct = require("../components/ReturnOrderProduct")
const InternalOrderProduct = require("../components/InternalOrderProduct")

class DatabaseHelper {
	constructor(dbFile) {
		this.dbFile = dbFile;
		this.db = new sqlite3.Database(this.dbFile, (err) => err && console.log(err));
		this.createTables();
	}

	queryDBAll(sql, params=[]){
		return new Promise((resolve, reject) => {
			this.db.all(sql, params, (err, rows) => {
				if(err) {
					console.log("Error query: "+sql);
					reject(err);
				} else {
					resolve(rows);
				}
			})
		})
	}

	queryDBRun(sql, params=[]){
		return new Promise((resolve, reject) => {
			this.db.run(sql, params, (err) => {
				if(err){
					console.log("Error query: "+sql);
					reject(err);
				}
				else
					resolve(true);
			})
		})
	}

	createTables() {
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

	/** SKU **/
	selectSKUs() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM SKU;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((row) => new SKU(row.SKUID, row.description, row.weight, row.volume, row.price, row.notes, row.availableQuantity, row.positionId)));
				}
			});
		});
	}

	selectSKUbyID(id) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM SKU WHERE SKUID = ?;`;
			this.db.get(sql, [id], (err, row) => {
				if (err) {
					reject(err.toString());
				} else {
					if (row) {
						resolve(new SKU(row.SKUID, row.description, row.weight, row.volume, row.price, row.notes, row.availableQuantity, row.positionId));
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	insertSKU(newSKU) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO SKU(description, weight, volume, price, notes, positionId, availableQuantity)
						 VALUES(?, ?, ?, ?, ?, ? , ?);`;
			this.db.run(sql, [newSKU.getDescription(), newSKU.getWeight(), newSKU.getVolume(), newSKU.getPrice(), newSKU.getNotes(), newSKU.getPosition(), newSKU.getAvailableQuantity()], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	updateSKU(newSKU) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE SKU
						 SET description = ?, weight = ?, volume = ?, price = ?, notes = ?, positionId = ?, availableQuantity = ?
						 WHERE SKUID=?;`;
			this.db.run(sql, [newSKU.getDescription(), newSKU.getWeight(), newSKU.getVolume(), newSKU.getPrice(), newSKU.getNotes(), newSKU.getPosition(), newSKU.getAvailableQuantity(), newSKU.getId()], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	deleteSKU(SKUid) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM SKU WHERE SKUID = ?;`;
			this.db.run(sql, [SKUid], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	/** SKU Item **/
	selectSKUItems() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM SKUItem;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((row) => new SKUItem(row.RFID, row.SKUID, row.available, row.dateOfStock)));
				}
			});
		});
	}

	selectSKUItemByRFID(rfid) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM SKUItem WHERE RFID = ?;`;
			this.db.get(sql, [rfid], (err, row) => {
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

	selectSKUItemBySKUID(skuid) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM SKUItem WHERE SKUID = ? AND available = 1;`;
			this.db.get(sql, [skuid], (err, row) => {
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

	insertSKUItem(newSKUItem) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO SKUItem(RFID, SKUID, available, dateOfStock)
						 VALUES(?, ?, ?, ?);`;
			this.db.run(sql, [newSKUItem.getRFID(), newSKUItem.getSKUId(), newSKUItem.getAvailable(), newSKUItem.getDateOfStock()], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	updateSKUItem(rfid, newSKUItem) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE SKUItem
						 SET RFID = ?, available = ?, dateOfStock = ?
						 WHERE RFID=?;`;
			this.db.run(sql, [newSKUItem.getRFID(), newSKUItem.getAvailable(), newSKUItem.getDateOfStock(), rfid], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	deleteSKUItem(RFID) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM SKUItem WHERE RFID=?;`;
			this.db.run(sql, [RFID], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	/** Position **/
	selectPositions() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM Position;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((row) => new Position(row.posID, row.aisleID, row.row, row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume)));
				}
			});
		});
	}

	selectPositionByID(id) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM Position WHERE posID = ?;`;
			this.db.get(sql, [id], (err, row) => {
				if (err) {
					reject(err.toString());
				} else {
					if (row) {
						resolve(new Position(row.posID, row.aisleID, row.row, row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume));
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	insertPosition(newPosition) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO Position(posID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume)
						 VALUES(?, ?, ?, ?, ?, ?, ?, ?);`;
			this.db.run(sql, [newPosition.getPositionID(), newPosition.getAisleID(), newPosition.getRow(), newPosition.getCol(),
				newPosition.getMaxWeight(), newPosition.getMaxVolume(), newPosition.getOccupiedWeight(), newPosition.getOccupiedVolume()], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	updatePosition(oldPosID, newPosition) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE Position
						 SET posID = ?, aisleID = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?, occupiedVolume = ?
						 WHERE posID = ?;`;
			this.db.run(sql, [newPosition.getPositionID(), newPosition.getAisleID(), newPosition.getRow(), newPosition.getCol(),
							  newPosition.getMaxWeight(), newPosition.getMaxVolume(), newPosition.getOccupiedWeight(), newPosition.getOccupiedVolume(),
							  oldPosID], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	deletePosition(posID) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM Position WHERE posID = ?;`;
			this.db.run(sql, [posID], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	/** Test Descriptor **/
	selectTestDescriptors() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM TestDescriptor;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new TestDescriptor(r.id, r.name, r.procedureDescription, r.idSKU)));
				}
			});
		});
	}

	selectTestDescriptorByID(id) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM TestDescriptor WHERE id = ?;`;
			this.db.get(sql, [id], (err, row) => {
				if (err) {
					reject(err.toString());
				} else {
					if (row) {
						resolve(new TestDescriptor(row.id, row.name, row.procedureDescription, row.idSKU));
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	selectTestDescriptorsIDBySKUID(skuid) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT id FROM TestDescriptor WHERE idSKU = ?;`;
			this.db.all(sql, [skuid], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows);
				}
			});
		});
	}

	insertTestDescriptor(testDescriptor) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO TestDescriptor(name, procedureDescription, idSKU) VALUES (?, ?, ?);`;
			this.db.run(sql, [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	updateTestDescriptor(testDescriptor) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE TestDescriptor SET name = ?, procedureDescription = ?, idSKU = ? WHERE id = ?`;
			this.db.run(sql, [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU, testDescriptor.id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	deleteTestDescriptorByID(id) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM TestDescriptor WHERE id = ?`;
			this.db.run(sql, [id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	/** Test Result **/
	selectTestResults(rfid) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM TestResult WHERE rfid = ?;`;
			this.db.all(sql, [rfid], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new TestResult(r.id, r.idTestDescriptor, r.date, r.result, r.rfid)));
				}
			});
		});
	}

	selectTestResultByID(rfid, id) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM TestResult WHERE rfid = ? AND id = ?;`;
			this.db.get(sql, [rfid, id], (err, row) => {
				if (err) {
					reject(err.toString());
				} else {
					if (row) {
						resolve(new TestResult(row.id, row.idTestDescriptor, row.date, row.result, row.rfid));
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	insertTestResult(testResult) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO TestResult(idTestDescriptor, date, result, rfid) VALUES (?, ?, ?, ?);`;
			this.db.run(sql, [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.rfid], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	updateTestResult(testResult) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE TestResult SET idTestDescriptor = ?, date = ?, result = ? WHERE rfid = ? AND id = ?`;
			this.db.run(sql, [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.rfid, testResult.id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	deleteTestResultByID(rfid, id) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM TestResult WHERE rfid = ? AND id = ?`;
			this.db.run(sql, [rfid, id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	/** User **/
	selectUsers() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM User;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new User(r.id, r.name, r.surname, r.email, r.passwordHash, r.passwordSalt, r.type)));
				}
			});
		});
	}

	selectUserByEmail(email) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM User WHERE email = ?;`;
			this.db.get(sql, [email], (err, row) => {
				if (err) {
					reject(err.toString());
				} else {
					if (row) {
						resolve(new User(row.id, row.name, row.surname, row.email, row.passwordHash, row.passwordSalt, row.type));
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	insertUser(user) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO User(name, surname, email, passwordHash, passwordSalt, type) VALUES (?, ?, ?, ?, ?, ?);`;
			this.db.run(sql, [user.name, user.surname, user.email, user.passwordHash, user.passwordSalt, user.role], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	updateUser(user) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE User SET
				name = ?, surname = ?, email = ?, passwordHash = ?, passwordSalt = ?, type = ?
				WHERE id = ?`;
			this.db.run(sql, [user.name, user.surname, user.email, user.passwordHash, user.passwordSalt, user.role, user.id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	deleteUserByID(id) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM User WHERE id = ?`;
			this.db.run(sql, [id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	/** ITEM **/
	selectItems() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM Item;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new Item(r.ITEMID, r.description, r.price, r.SKUID, r.supplierID)));
				}
			});
		});
	}

	insertItem(newItem /*: Object*/) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO Item(ITEMID, description, price, SKUID, supplierID) VALUES (?, ?, ?, ?, ?);`;
			this.db.run(sql, [newItem.getItemId(), newItem.getDescription(), newItem.getPrice(), newItem.getSKUId(), newItem.getSupplierId()], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	updateItem(newItem /*: Object*/) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE Item SET
				description = ?, price = ?, SKUID = ?, supplierID = ?
				WHERE ITEMID = ?;`;
			this.db.run(sql, [newItem.getDescription(), newItem.getPrice(), newItem.getSKUId(), newItem.getSupplierId(), newItem.getItemId()], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});

	}

	deleteItem(id) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM Item WHERE ITEMID = ?`;
			this.db.run(sql, [id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	selectItemByID(id) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM Item WHERE ITEMID = ?;`;
			this.db.get(sql, [id], (err, row) => {
				if (err) {
					reject(err.toString());
				} else {
					if (row) {
						resolve(new Item(row.ITEMID, row.description, row.price, row.SKUID, row.supplierID));
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	/** RESTOCK ORDER **/
	selectRestockOrders() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM RestockOrder;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new RestockOrder(r.ROID, r.issueDate, r.state, r.products, r.supplierId, r.transportNote)));
				}
			});
		});
	}

	selectRestockOrdersIssued() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM RestockOrder WHERE state = ?;`;
			this.db.all(sql, ['issued'], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new RestockOrder(r.ROID, r.issueDate, r.state, r.products, r.supplierId, r.transportNote)));
				}
			});
		});
	}

	insertRestockOrder(newRO /*: Object*/) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO RestockOrder(issueDate, state, products, supplierId, transportNote) VALUES (?, ?, ?, ?, ?);`;
			this.db.run(sql, [newRO.issueDate, newRO.state, newRO.products, newRO.supplierId, newRO.transportNote], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	updateRestockOrder(newRO /*: Object*/) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE RestockOrder SET
				issueDate = ?, state = ?, supplierId = ?, transportNote = ?
				WHERE ROID = ?`;
			this.db.run(sql, [newRO.issueDate, newRO.state, newRO.products, newRO.supplierId, newRO.transportNote], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});

	}

	deleteRestockOrder(id) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM Item WHERE ROID = ?`;
			this.db.run(sql, [id], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	selectRestockOrderByID(id) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM RestockOrder WHERE ROID = ?;`;
			this.db.get(sql, [id], (err, row) => {
				if (err) {
					reject(err.toString());
				} else {
					if (row) {
						resolve(new RestockOrder(row.ROID, row.issueDate, row.state, row.products, row.supplierId, row.transportNote));
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	selectProducts(roid) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT skuItems FROM RestockOrder WHERE ROID = ?`;
			const ro = this.selectRestockOrderByID(roid)
			this.db.all(sql,
				[ro.forEach(x => x.getSKUItems()
					.filter(v =>
					{
						if (v.getTestResults().filter(w => w.getResult() === false).count() > 0) return true;
						else return false;
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

	insertProducts(RO,items) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE RestockOrder SET
				products = ?
				WHERE ROID = ?`;
			this.db.run(sql, [RO.addItems(items),RO.ROID], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});

	}

	/** Return Order **/
	selectReturnOrders() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM ReturnOrder;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new ReturnOrder(r.returnOrderId, r.returnDate, r.restockOrderId)));
				}
			});
		});
	}

	selectReturnOrderByID(returnOrderId) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM ReturnOrder WHERE returnOrderId = ?;`;
			this.db.get(sql, [returnOrderId], (err, row) => {
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

	insertReturnOrder(returnOrder) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO ReturnOrder(returnDate, restockOrderId) VALUES (?, ?);`;
			this.db.run(sql, [returnOrder.returnDate, returnOrder.restockOrderId], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	deleteReturnOrder(returnOrderId) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM ReturnOrder WHERE returnOrderId = ?`;
			this.db.run(sql, [returnOrderId], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}


	selectReturnOrderProducts() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM ReturnOrderProduct;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new ReturnOrderProduct(r.returnOrderId, r.ITEMID, r.price)));
				}
			});
		});
	} 

	selectReturnOrderProductByID(returnOrderId) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM ReturnOrderProduct WHERE returnOrderId = ?;`;
			this.db.all(sql, [returnOrderId], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new ReturnOrderProduct(r.returnOrderId, r.ITEMID, r.price)));
				}
			});
		});
	}

	insertReturnOrderProduct(ReturnOrderProduct) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO ReturnOrderProduct(returnOrderId, ITEMID, price) VALUES (?, ?, ?);`;
			this.db.run(sql, [ReturnOrderProduct.returnOrderId, ReturnOrderProduct.ITEMID, ReturnOrderProduct.price], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	deleteReturnOrderProduct(returnOrderId, ITEMID) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM ReturnOrderProduct WHERE returnOrderId = ?`;
			this.db.run(sql, [returnOrderId, ITEMID], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	updateReturnOrderProduct(returnOrderProduct) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE ReturnOrderProduct SET price = ? WHERE returnOrderId = ?, ITEMID = ?`;
			this.db.run(sql, [returnOrderProduct.price, returnOrderProduct.returnOrderId, returnOrderProduct.ITEMID], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	/** Internal Order **/
	selectInternalOrders() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM InternalOrder;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new InternalOrder(r.internalOrderId, r.issueDate, r.state, r.customerId)));
				}
			});
		});
	}

	selectInternalOrderByID(internalOrderId) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM InternalOrder WHERE internalOrderId = ?;`;
			this.db.get(sql, [internalOrderId], (err, row) => {
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

	selectInternalOrdersIssued() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM InternalOrder WHERE state = ?;`;
			this.db.all(sql, ['issued'], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new InternalOrder(r.internalOrderId, r.issueDate, r.state, r.customerId)));
				}
			});
		});
	}

	selectInternalOrdersAccepted() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM InternalOrder WHERE state = ?;`;
			this.db.all(sql, ['accepted'], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new InternalOrder(r.internalOrderId, r.issueDate, r.state, r.customerId)));
				}
			});
		});
	}

	insertInternalOrder(internalOrder) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO InternalOrder(issueDate, state, customerId) VALUES (?, ?, ?);`;
			this.db.run(sql, [internalOrder.issueDate, internalOrder.state, internalOrder.customerId], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	updateInternalOrder(internalOrder) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE InternalOrder SET state = ? WHERE internalOrderId = ?`;
			this.db.run(sql, [internalOrder.state, internalOrder.internalOrderId], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	deleteInternalOrder(internalOrderId) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM InternalOrder WHERE internalOrderId = ?`;
			this.db.run(sql, [internalOrderId], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	selectInternalOrderProducts() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM InternalOrderProduct;`;
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new InternalOrderProduct(r.internalOrderId, r.ITEMID, r.quantity)));
				}
			});
		});
	} 

	selectInternalOrderProductByID(internalOrderId) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM InternalOrderProduct WHERE internalOrderId = ?;`;
			this.db.all(sql, [internalOrderId], (err, rows) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve(rows.map((r) => new InternalOrderProduct(r.internalOrderId, r.ITEMID, r.quantity)));
				}
			});
		});
	}

	insertInternalOrderProduct(internalOrderProduct) {
		return new Promise((resolve, reject) => {
			const sql = `INSERT INTO InternalOrderProduct(internalOrderId, ITEMID, quantity) VALUES (?, ?, ?);`;
			this.db.run(sql, [internalOrderProduct.internalOrderId, internalOrderProduct.ITEMID, internalOrderProduct.quantity], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			})
		});
	}

	deleteInternalOrderProduct(internalOrderId) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM InternalOrderProduct WHERE internalOrderId = ?`;
			this.db.run(sql, [internalOrderId], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

	updateInternalOrderProduct(internalOrderProduct) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE InternalOrderProduct SET quantity = ? WHERE internalOrderId = ?`;
			this.db.run(sql, [internalOrderProduct.quantity, internalOrderProduct.internalOrderId, internalOrderProduct.ITEMID], (err) => {
				if (err) {
					reject(err.toString());
				} else {
					resolve();
				}
			});
		});
	}

}

exports.DatabaseHelper = DatabaseHelper;
