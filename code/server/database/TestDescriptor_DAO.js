const TestDescriptor = require("../components/TestDescriptor");
const DatabaseConnection = require("./DatabaseConnection");


exports.selectTestDescriptors = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM TestDescriptor;`;
        DatabaseConnection.db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new TestDescriptor(r.id, r.name, r.procedureDescription, r.idSKU)));
            }
        });
    });
}

exports.selectTestDescriptorByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM TestDescriptor WHERE id = ?;`;
        DatabaseConnection.db.get(sql, [id], (err, row) => {
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

exports.selectTestDescriptorsIDBySKUID = (skuid) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM TestDescriptor WHERE idSKU = ?;`;
        DatabaseConnection.db.all(sql, [skuid], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map(row => row.id));
            }
        });
    });
}

exports.insertTestDescriptor = (testDescriptor) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO TestDescriptor(name, procedureDescription, idSKU) VALUES (?, ?, ?);`;
        DatabaseConnection.db.run(sql, [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        })
    });
}

exports.updateTestDescriptor = (testDescriptor) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE TestDescriptor SET name = ?, procedureDescription = ?, idSKU = ? WHERE id = ?`;
        DatabaseConnection.db.run(sql, [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU, testDescriptor.id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.deleteTestDescriptorByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM TestDescriptor WHERE id = ?`;
        DatabaseConnection.db.run(sql, [id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(true);
            }
        });
    });
}

/** used for testing **/
exports.deleteTestDescriptorData = () => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM TestDescriptor';
        DatabaseConnection.db.run(sql, [], function (err) {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        })
    })
};
