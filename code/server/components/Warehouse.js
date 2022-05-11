const crypto = require("crypto");

const {DatabaseHelper} = require("../database/DatabaseHelper");
const {UserRole, User} = require("./User");

class Warehouse {
	constructor(dbFile="./database/ezwh.db") {
		this.db_help = new DatabaseHelper(dbFile);
	}

	/** TEST DESCRIPTOR **/

	/** USER **/
	getCurrentUser() {
		// TODO
		return {};
	}

	getSuppliers() {
		return this.db_help.selectUsers().then((users) => users.filter((u) => u.role === UserRole.SUPPLIER));
	}

	getUsers() {
		return this.db_help.selectUsers().then((users) => users.filter((u) => u.role !== UserRole.MANAGER));
	}

	async newUser(email, name, surname, password, type) {
		if (!Object.values(UserRole).includes(type)) return {status: 422, body: "type does not exist"};

		try {
			const user = await this.db_help.selectUserByEmail(email);
			if (user && user.role === type) return {status: 409, body: "username already exists"};

			const passwordSalt = crypto.randomBytes(256).toString("base64");
			const passwordHash = crypto.createHash("sha256")
				.update(password, "utf8")
				.update(passwordSalt)
				.digest("base64");

			await this.db_help.insertUser(new User(null, name, surname, email, passwordHash, passwordSalt, type));
			return {status: 201, body: ""};
		} catch (e) {
			console.log("exception", e);
			return {status: 503, body: e};
		}
	}

	async session(email, password, role) {
		try {
			const user = await this.db_help.selectUserByEmail(email);
			if (user && user.role === role && user.checkPassword(password)) {
				return {status: 200, body: {id: user.id, username: user.email, name: user.name, surname: user.surname}};
			} else {
				// login fails if the user is not present, the role is wrong or the password is wrong
				return {status: 401, body: "wrong username password or role"};
			}
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	async modifyUserRights(email, oldType, newType) {
		const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
		if (!allowedTypes.includes(oldType) || !allowedTypes.includes(newType)) return {status: 422, body: "invalid type"};

		try {
			const user = await this.db_help.selectUserByEmail(email);
			if (!user || user.role !== oldType) return {status: 404, body: "wrong user or type"};
			user.role = newType;
			await this.db_help.updateUser(user);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	async deleteUser(email, type) {
		const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
		if (!allowedTypes.includes(type)) return {status: 422, body: "invalid type"};

		try {
			const user = await this.db_help.selectUserByEmail(email);
			if (!user.role === type) return {status: 422, body: "wrong type"};
			await this.db_help.deleteUserByID(user.id);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
}

exports.Warehouse = Warehouse;
