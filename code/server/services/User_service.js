const crypto = require("crypto");

const {User, UserRole} = require("../components/User");

const User_DAO = require("../database/User_DAO");


exports.getCurrentUser = () => {
	// TODO
	return {};
}

exports.getUsers = () => {
	return User_DAO.selectUsers().then((users) => users.filter((u) => u.role !== UserRole.MANAGER));
}

exports.getUsersByRole = (role) => {
	return User_DAO.selectUsers().then((users) => users.filter((u) => u.role === role));
}

exports.createUser = async (email, name, surname, password, type) => {
	const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
	if (!allowedTypes.includes(type)) return {status: 422, body: "type does not exist"};

	try {
		const user = await User_DAO.selectUserByEmailAndType(email, type);
		if (user) return {status: 409, body: "username already exists"};

		const passwordSalt = crypto.randomBytes(256).toString("base64");
		const passwordHash = crypto.createHash("sha256")
			.update(password, "utf8")
			.update(passwordSalt)
			.digest("base64");

		await User_DAO.insertUser(new User(null, name, surname, email, passwordHash, passwordSalt, type));
		return {status: 201, body: ""};
	} catch (e) {
		console.log("exception", e);
		return {status: 503, body: e};
	}
}

exports.session = async (email, password, role) => {
	try {
		const user = await User_DAO.selectUserByEmailAndType(email, role);
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

exports.logout = () => {
	// TODO
	return true;
}

exports.updateUserRights = async (email, oldType, newType) => {
	const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
	if (!allowedTypes.includes(oldType) || !allowedTypes.includes(newType)) return {status: 422, body: "invalid type"};

	try {
		const user = await User_DAO.selectUserByEmailAndType(email, oldType);
		if (!user) return {status: 404, body: "wrong user or type"};
		user.role = newType;
		await User_DAO.updateUser(user);
		return {status: 200, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.deleteUser = async (email, type) => {
	const allowedTypes = ["customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier"];
	if (!allowedTypes.includes(type)) return {status: 422, body: "invalid type"};

	try {
		const user = await User_DAO.selectUserByEmailAndType(email, type);
		if (user) await User_DAO.deleteUserByID(user.id);
		return {status: 204, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}
