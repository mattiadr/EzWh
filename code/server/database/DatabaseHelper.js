const sqlite3 = require("sqlite3");

const SKU = require("../components/SKU");
const SKUItem = require("../components/SKUItem");
const Position = require("../components/Position");
const {User} = require("../components/User");
const {TestDescriptor} = require("../components/TestDescriptor");
const {TestResult} = require("../components/TestResult");

class DatabaseHelper {
	constructor(dbFile) {
		this.dbFile = dbFile;
		this.db = new sqlite3.Database(this.dbFile, (err) => err && console.log(err));
		this.createTables();

		// TODO remove maps?
		this.SKUs = new Map();
		this.SKUItems = new Map();
		this.Positions = new Map();
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
			SKUID varchar(12) PRIMARY KEY,
			description varchar(100) NOT NULL,
			weight double NOT NULL,
			volume double NOT NULL,
			price double NOT NULL,
			notes varchar(50) NOT NULL,
			positionId varchar(12),
			availableQuantity integer NOT NULL
		);`;
		this.db.run(createTableSKU, (err) => err && console.log(err));

		/** SKU Item **/
		const createTableSKUItem = `CREATE TABLE IF NOT EXISTS SKUItem (
			RFID varchar(50) PRIMARY KEY,
			SKUID varchar(12) NOT NULL,
			available boolean DEFAULT 0,
			dateOfStock DATETIME
		);`;
		this.db.run(createTableSKUItem, (err) => err && console.log(err));

		/** Position **/
		const createTablePosition = `CREATE TABLE IF NOT EXISTS Position (
			posID varchar(12) PRIMARY KEY,
			aisleID varchar(4) NOT NULL,
			row varchar(4) NOT NULL,
			col varchar(4) NOT NULL,
			maxWeight integer NOT NULL,
			maxVolume integer NOT NULL,
			occupiedWeight integer DEFAULT 0,
			occupiedValue integer DEFAULT 0
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
	}

	/** SKU **/
	async loadSKU() {//: Map <String,SKU>
		if (this.SKUs.size === 0) { //first time
			let rows = await this.queryDBAll(`SELECT * FROM SKU;`);

			rows.map(row => {
				const sku = new SKU(row.SKUID, row.description, row.weight, row.volume, row.price, row.notes, row.availableQuantity, row.positionId);
				this.SKUs.set(row.SKUID, sku);
			})
		}
		return this.SKUs;
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

	async storeSKU(newSKU /*: Object*/) {
		await this.queryDBRun(`
			INSERT INTO SKU(SKUID, description, weight, volume, price, notes, positionId, availableQuantity)
			VALUES(?, ?, ?, ?, ?, ?, ? , ?);
		`,[newSKU.getId(), newSKU.getDescription(), newSKU.getWeight(), newSKU.getVolume(), newSKU.getPrice(), newSKU.getNotes(), newSKU.getPosition(), newSKU.getAvailableQuantity()]);
		this.SKUs.set(newSKU.id, newSKU);
	}

	async updateSKU(newSKU /*: Object*/) {
		await this.queryDBRun(`
			UPDATE SKU
			SET description = ?, weight = ?, volume = ?, price = ?, notes = ?, positionId = ?, availableQuantity = ?
			WHERE SKUID=?;
		`,[newSKU.getDescription(), newSKU.getWeight(), newSKU.getVolume(), newSKU.getPrice(), newSKU.getNotes(), newSKU.getPosition(), newSKU.getAvailableQuantity(), newSKU.getId()]);
		this.SKUs.set(newSKU.getId(), newSKU);
	}

	async deleteSKU(SKUid) {
		await this.queryDBRun(`
			DELETE
			FROM SKU
			WHERE SKUID=?;
		`, [SKUid]);
		this.SKUs.delete(SKUid);
	}

	/** SKU Item **/
	async loadSKUItem() { //: Map<String,SKUItem>
		if (this.SKUItems.size === 0 ) { //first time
			let rows = await this.queryDBAll(`SELECT * FROM SKUItem;`);

			rows.map(row => {
				const skuItem = new SKUItem(row.RFID, row.SKUID, row.available, row.dateOfStock);
				this.SKUItems.set(row.RFID, skuItem);

			})
		}
		return this.SKUItems;
	}

	selectSKUItemByRFID(rfid) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM SKU WHERE RFID = ?;`;
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

	async storeSKUItem(newSKUItem /*: Object*/) {
		await this.queryDBRun(`
			INSERT INTO SKUItem(RFID, SKUID, available, dateOfStock)
			VALUES(?, ?, ?, ?);
		`,[newSKUItem.getRFID(), newSKUItem.getSKUId(), newSKUItem.getAvailable(), newSKUItem.getDateOfStock()]);
		this.SKUItems.set(newSKUItem.RFID, newSKUItem);
	}

	async updateSKUItem(rfid, newSKUItem /*: Object*/) {
		await this.queryDBRun(`
			UPDATE SKUItem
			SET RFID = ?, available = ?, dateOfStock = ?
			WHERE RFID=?;
		`,[newSKUItem.getRFID(), newSKUItem.getAvailable(), newSKUItem.getDateOfStock(), rfid]);
		this.SKUItems.delete(rfid);
		this.SKUItems.set(rfid, newSKUItem);
	}

	async deleteSKUItem(RFID) {
		await this.queryDBRun(`
			DELETE
			FROM SKUItem
			WHERE RFID=?;
		`, [RFID]);
		this.SKUItems.delete(RFID);
	}

	/** Position **/
	async loadPosition() { //: Map<String, Position>
		if (this.Positions.size === 0 ) { //first time
			let rows = await this.queryDBAll(`SELECT * FROM Position;`);

			rows.map(row => {
				const pos = new Position(row.posID, row.aisleID, row.row, row.col, row.maxWeight, row.maxVolume, row.occupedWeight, row.occupedVolume);
				this.Positions.set(row.posID, pos);

			})
		}
		return this.Positions;
	}

	async storePosition(newPosition /*: Object*/) {
		await this.queryDBRun(`
			INSERT INTO Position(posID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedValue)
			VALUES(?, ?, ?, ?, ?, ?, ?, ?);
		`,[newPosition.getPositionID(), newPosition.getAisleID(), newPosition.getRow(), newPosition.getCol(),
			newPosition.getMaxWeight(), newPosition.getMaxVolume(), newPosition.getOccupiedWeight(), newPosition.getOccupiedVolume()]);
		this.Positions.set(newPosition.getPositionID(), newPosition);
	}

	async updatePosition(oldPosID, newPosition /*: Object*/) {
		await this.queryDBRun(`
			UPDATE Position
			SET posID = ?, aisleID = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?, occupiedValue = ?
			WHERE posID = ?;
		`,[newPosition.getPositionID(), newPosition.getAisleID(), newPosition.getRow(), newPosition.getCol(),
			newPosition.getMaxWeight(), newPosition.getMaxVolume(), newPosition.getOccupiedWeight(), newPosition.getOccupiedVolume(),
		oldPosID]);
		this.Positions.delete(oldPosID);
		this.Positions.set(newPosition.getPositionID(), newPosition);
	}

	async deletePosition(posID) {
		await this.queryDBRun(`
			DELETE
			FROM Position
			WHERE posID=?;
		`, [posID]);
		this.Positions.delete(posID);
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
}

exports.DatabaseHelper = DatabaseHelper;
