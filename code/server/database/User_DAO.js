const DatabaseConnection = require("./DatabaseConnection");
const {User} = require("../components/User");


const db = DatabaseConnection.getInstance();

exports.selectUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM User;`;
        db.all(sql, [], (err, rows) => {
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
        db.get(sql, [email, type], (err, row) => {
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
        db.run(sql, [user.name, user.surname, user.email, user.passwordHash, user.passwordSalt, user.role], (err) => {
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
        db.run(sql, [user.name, user.surname, user.email, user.passwordHash, user.passwordSalt, user.role, user.id], (err) => {
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
        db.run(sql, [id], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.deleteUserData = () => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM User`;
        db.run(sql, [], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}
