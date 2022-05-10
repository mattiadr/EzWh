const crypto = require("crypto");

const UserRole = Object.freeze({
	ADMINISTRATOR: "administrator",
	MANAGER: "manager",
	CLERK: "clerk",
	QUALITY_CHECKER: "qualityEmployee",
	DELIVERY: "deliveryEmployee",
	CUSTOMER: "customer",
	SUPPLIER: "supplier",
});


class User {
	constructor(id, name, surname, email, passwordHash, passwordSalt, role) {
		// TODO remove id and use email as primary key?
		this.id = id;
		this.name = name;
		this.surname = surname;
		this.email = email;
		this.passwordHash = passwordHash;
		this.passwordSalt = passwordSalt;
		this.role = role;
	}

	checkPassword(password) {
		const hash = crypto.createHash("sha256")
			.update(password, "utf8")
			.update(this.passwordSalt)
			.digest("base64");
		return hash === this.passwordHash;
	}
}

exports.UserRole = UserRole;
exports.User = User;
