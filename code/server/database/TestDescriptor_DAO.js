const TestDescriptor = require("../components/TestDescriptor");
const DatabaseConnection = require("./DatabaseConnection");


const db = DatabaseConnection.getInstance();

exports.selectTestDescriptors = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM TestDescriptor;`;
        db.all(sql, [], (err, rows) => {
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
        db.get(sql, [id], (err, row) => {
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
        db.all(sql, [skuid], (err, rows) => {
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
        db.run(sql, [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU], (err) => {
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
        db.run(sql, [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU, testDescriptor.id], (err) => {
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
        db.run(sql, [id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(true);
            }
        });
    });
}

exports.deleteTestDescriptorData = () => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE * FROM TestDescriptor`;
        db.run(sql, [], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(true);
            }
        });
    });
}
