const sqlite3 = require("sqlite3");

const {User} = require("../components/User");
const {TestDescriptor} = require("../components/TestDescriptor");

class DatabaseHelper {
	constructor(dbFile) {
		this.dbFile = dbFile;
		this.db = new sqlite3.Database(this.dbFile, (err) => err && console.log(err));
		this.createTables();
	}

	createTables() {
		/** TEST DESCRIPTOR **/
		// TODO check if idSKU is needed
		const createTableTestDescriptor = `CREATE TABLE IF NOT EXISTS TestDescriptor (
			id INTEGER NOT NULL,
			name VARCHAR(64) NOT NULL,
			procedureDescription VARCHAR(512) NOT NULL,
			idSKU INTEGER NOT NULL,
			PRIMARY KEY (id)
		);`;
		this.db.run(createTableTestDescriptor, (err) => err && console.log(err));

		/** USER **/
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

	/** TEST DESCRIPTOR **/
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

	/** USER **/
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
