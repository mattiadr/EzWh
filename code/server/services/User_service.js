const crypto = require("crypto");

const {User, UserRole} = require("../components/User");

class UserService {
	#user_DAO;

	constructor(user_DAO) {
		this.#user_DAO = user_DAO;
	}

	getCurrentUser() {
		// TODO
		return {};
	}

	getUsers() {
		return this.#user_DAO.selectUsers().then((users) => users.filter((u) => u.role !== UserRole.MANAGER));
	}

	getUsersByRole(role) {
		return this.#user_DAO.selectUsers().then((users) => users.filter((u) => u.role === role));
	}

	async createUser(email, name, surname, password, type) {
		const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
		if (!allowedTypes.includes(type)) return {status: 422, body: "type does not exist"};

		try {
			const user = await this.#user_DAO.selectUserByEmailAndType(email, type);
		if (user) return {status: 409, body: "username already exists"};

			const passwordSalt = crypto.randomBytes(32).toString("base64");
			const passwordHash = crypto.createHash("sha256")
				.update(password, "utf8")
				.update(passwordSalt)
				.digest("base64");

			await this.#user_DAO.insertUser(new User(null, name, surname, email, passwordHash, passwordSalt, type));
			return {status: 201, body: ""};
		} catch (e) {
			console.log("exception", e);
			return {status: 503, body: e};
		}
	}

	async session(email, password, role) {
		try {
			const user = await this.#user_DAO.selectUserByEmailAndType(email, role);
			if (user && user.checkPassword(password)) {
				return {status: 200, body: {id: user.id, username: user.email, name: user.name, surname: user.surname}};
			} else {
				// login fails if the user is not present, the role is wrong or the password is wrong
				return {status: 401, body: "wrong username password or role"};
			}
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	logout() {
		// TODO
		return true;
	}

	async updateUserRights(email, oldType, newType) {
		const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
		if (!allowedTypes.includes(oldType) || !allowedTypes.includes(newType)) return {status: 422, body: "invalid type"};

		try {
			const user = await this.#user_DAO.selectUserByEmailAndType(email, oldType);
		if (!user) return {status: 404, body: "wrong user or type"};
			user.role = newType;
			await this.#user_DAO.updateUser(user);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	async deleteUser(email, type) {
		const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
		if (!allowedTypes.includes(type)) return {status: 422, body: "invalid type"};

		try {
			const user = await this.#user_DAO.selectUserByEmailAndType(email, type);
			if (user) await this.#user_DAO.deleteUserByID(user.id);
			return {status: 204, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
}

module.exports = UserService;
