const crypto = require("crypto");

const {DatabaseHelper} = require("../database/DatabaseHelper");
const {UserRole, User} = require("./User");

class Warehouse {
	constructor() {
		this.db_help = new DatabaseHelper();
		this.user_sessions = {};
	}

	/** USER **/
	getCurrentUser() {
		// TODO
		return this.db_help.getUsers()[0];
	}

	currentUserMatchesRole(arg) {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return false; // no user is logged in, deny
		// TODO remove admin?
		if (currentUser.role === UserRole.ADMINISTRATOR) return true; // administrator is always allowed

		if (!arg) {
			// no specific role needed, allow
			return true;
		} else if (Array.isArray(arg)) {
			// multiple roles specified, check if current user is in array
			return arg.includes(currentUser.role);
		} else {
			// single role specified, check if current user matches
			return currentUser.role === arg;
		}
	}

	getSuppliers() {
		const users = this.db_help.getUsers();
		return users.filter((u) => u.role === UserRole.SUPPLIER);
	}

	getUsers() {
		const users = this.db_help.getUsers();
		return users.filter((u) => u.role !== UserRole.MANAGER);
	}

	newUser(username, name, surname, password, type) {
		const users = this.db_help.getUsers();
		if (users.find((u) => u.email === username)) return 409; // conflict username already exists
		if (!Object.values(UserRole).includes(type)) return 422; // unprocessable, type does not exist

		const nextID = users.length;
		const passwordSalt = "test123"; // TODO
		const passwordHash = crypto.createHash("sha256")
			.update(password, "utf8")
			.update(passwordSalt)
			.digest("base64");

		this.db_help.addUser(nextID, new User(nextID, name, surname, username, passwordHash, passwordSalt, type));
		return 201; // created
	}

	session(email, password, role) {
		const users = this.db_help.getUsers();
		const user = users.find((u) => u.email === email);

		if (user && user.role === role && user.checkPassword(password)) {
			// TODO create session
			return user;
		} else {
			// login fails if the user is not present, the role is wrong or the password is wrong
			return false;
		}
	}


}

exports.Warehouse = Warehouse;
