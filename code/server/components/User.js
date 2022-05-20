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
	#id; #name; #surname; #email; #passwordHash; #passwordSalt; #role;

	constructor(id, name, surname, email, passwordHash, passwordSalt, role) {
		this.#id = id;
		this.#name = name;
		this.#surname = surname;
		this.#email = email;
		this.#passwordHash = passwordHash;
		this.#passwordSalt = passwordSalt;
		this.#role = role;
	}

	get id() { return this.#id; }
	get name() { return this.#name; }
	get surname() { return this.#surname; }
	get email() { return this.#email; }
	get passwordHash() { return this.#passwordHash; }
	get passwordSalt() { return this.#passwordSalt; }
	get role() { return this.#role; }

	set role(role) { this.#role = role; }

	checkPassword(password) {
		const hash = crypto.createHash("sha256")
			.update(password, "utf8")
			.update(this.#passwordSalt)
			.digest("base64");
		return hash === this.#passwordHash;
	}
}

module.exports.UserRole = UserRole;
module.exports.User = User;
