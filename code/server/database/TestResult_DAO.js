const DatabaseConnection = require("./DatabaseConnection");
const TestResult = require("../components/TestResult");


const db = DatabaseConnection.getInstance();

exports.selectTestResults = (rfid) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM TestResult WHERE rfid = ?;`;
		db.all(sql, [rfid], (err, rows) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve(rows.map((r) => new TestResult(r.id, r.idTestDescriptor, r.date, r.result, r.rfid)));
			}
		});
	});
}

exports.selectTestResultByID = (rfid, id) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM TestResult WHERE rfid = ? AND id = ?;`;
		db.get(sql, [rfid, id], (err, row) => {
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

exports.insertTestResult = (testResult) => {
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO TestResult(idTestDescriptor, date, result, rfid) VALUES (?, ?, ?, ?);`;
		db.run(sql, [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.rfid], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		})
	});
}

exports.updateTestResult = (testResult) => {
	return new Promise((resolve, reject) => {
		const sql = `UPDATE TestResult SET idTestDescriptor = ?, date = ?, result = ? WHERE rfid = ? AND id = ?`;
		db.run(sql, [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.rfid, testResult.id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	});
}

exports.deleteTestResultByID = (rfid, id) => {
	return new Promise((resolve, reject) => {
		const sql = `DELETE FROM TestResult WHERE rfid = ? AND id = ?`;
		db.run(sql, [rfid, id], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	});
}

/** used for testing **/
exports.deleteTestResultData = () => {
	return new Promise((resolve, reject) => {
		const sql = `DELETE FROM TestResult`;
		db.run(sql, [], (err) => {
			if (err) {
				reject(err.toString());
			} else {
				resolve();
			}
		});
	});
}
