const DatabaseConnection = require("./DatabaseConnection");
const Position = require("../components/Position");


exports.selectPositions = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Position;`;
        DatabaseConnection.db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((row) => new Position(row.posID, row.aisleID, row.row, row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume)));
            }
        });
    });
}

exports.selectPositionByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Position WHERE posID = ?;`;
        DatabaseConnection.db.get(sql, [id], (err, row) => {
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

exports.insertPosition = (newPosition) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Position(posID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume)
                     VALUES(?, ?, ?, ?, ?, ?, ?, ?);`;
        DatabaseConnection.db.run(sql, [newPosition.getPositionID(), newPosition.getAisleID(), newPosition.getRow(), newPosition.getCol(),
        newPosition.getMaxWeight(), newPosition.getMaxVolume(), newPosition.getOccupiedWeight(), newPosition.getOccupiedVolume()], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        })
    });
}

exports.updatePosition = (oldPosID, newPosition) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Position
                     SET posID = ?, aisleID = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?, occupiedVolume = ?
                     WHERE posID = ?;`;
        DatabaseConnection.db.run(sql, [newPosition.getPositionID(), newPosition.getAisleID(), newPosition.getRow(), newPosition.getCol(),
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

exports.deletePosition = (posID) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Position WHERE posID = ?;`;
        DatabaseConnection.db.run(sql, [posID], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

/** used for testing **/
exports.deletePositionData = () => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Position`;
        DatabaseConnection.db.run(sql, [], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}
