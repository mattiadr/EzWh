const {User, UserRole} = require("../components/User");

class UserService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

	getCurrentUser = () => {
		// TODO
		return {};
	}
	
	getUsers = () => {
		return this.dao.selectUsers().then((users) => users.filter((u) => u.role !== UserRole.MANAGER));
	}
	
	getUsersByRole = (role) => {
		return this.dao.selectUsers().then((users) => users.filter((u) => u.role === role));
	}
	
	createUser = async (email, name, surname, password, type) => {
		if (!Object.values(UserRole).includes(type)) return {status: 422, body: "type does not exist"};
	
		try {
			const user = await this.dao.selectUserByEmail(email);
			if (user && user.role === type) return {status: 409, body: "username already exists"};
	
			const passwordSalt = crypto.randomBytes(256).toString("base64");
			const passwordHash = crypto.createHash("sha256")
				.update(password, "utf8")
				.update(passwordSalt)
				.digest("base64");
	
			await this.dao.insertUser(new User(null, name, surname, email, passwordHash, passwordSalt, type));
			return {status: 201, body: ""};
		} catch (e) {
			console.log("exception", e);
			return {status: 503, body: e};
		}
	}
	
	session = async (email, password, role) => {
		try {
			const user = await this.dao.selectUserByEmail(email);
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
	
	logout = () => {
		// TODO
		return true;
	}
	
	updateUserRights = async (email, oldType, newType) => {
		const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
		if (!allowedTypes.includes(oldType) || !allowedTypes.includes(newType)) return {status: 422, body: "invalid type"};
	
		try {
			const user = await this.dao.selectUserByEmail(email);
			if (!user || user.role !== oldType) return {status: 404, body: "wrong user or type"};
			user.role = newType;
			await this.dao.updateUser(user);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteUser = async (email, type) => {
		const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
		if (!allowedTypes.includes(type)) return {status: 422, body: "invalid type"};
	
		try {
			const user = await this.dao.selectUserByEmail(email);
			if (!user.role === type) return {status: 422, body: "wrong type"};
			await this.dao.deleteUserByID(user.id);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
}

module.exports = UserService;
