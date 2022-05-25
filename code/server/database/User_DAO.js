const DatabaseConnection = require("./DatabaseConnection");
const {User} = require("../components/User");


exports.selectUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM User;`;
        DatabaseConnection.db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((r) => new User(r.id, r.name, r.surname, r.email, r.passwordHash, r.passwordSalt, r.type)));
            }
        });
    });
}

exports.selectUserByEmailAndType = (email, type) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM User WHERE email = ? AND type = ?;`;
        DatabaseConnection.db.get(sql, [email, type], (err, row) => {
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

exports.insertUser = (user) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO User(name, surname, email, passwordHash, passwordSalt, type) VALUES (?, ?, ?, ?, ?, ?);`;
        DatabaseConnection.db.run(sql, [user.name, user.surname, user.email, user.passwordHash, user.passwordSalt, user.role], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.updateUser = (user) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE User SET
                     name = ?, surname = ?, email = ?, passwordHash = ?, passwordSalt = ?, type = ?
                     WHERE id = ?`;
        DatabaseConnection.db.run(sql, [user.name, user.surname, user.email, user.passwordHash, user.passwordSalt, user.role, user.id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.deleteUserByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM User WHERE id = ?`;
        DatabaseConnection.db.run(sql, [id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

/** used for testing **/
exports.deleteUserData = () => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM User`;
        DatabaseConnection.db.run(sql, [], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}
