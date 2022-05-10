const {User, UserRole} = require("../components/User");

class DatabaseHelper {
	constructor() {
		this.users = null;
		this.loadUsers();
	}

	loadUsers() {
		// TODO the first time the SKUs are requested we pull from the DB
		// get from DB
		// call SKU constructor for each row in the table and add to the map
		this.users = [];
		// password is "password"
		// TODO change passwords
		this.users[0] = new User(0, "Super", "Admin", "super.admin@ezwh.com", "NQzIIM1qR4oF+f3a3k0cvcJMSaO7/7OykM/U70g1pFk=", "test123", UserRole.ADMINISTRATOR);
		this.users[1] = new User(1, "John", "Snow", "john.snow@ezwh.com", "NQzIIM1qR4oF+f3a3k0cvcJMSaO7/7OykM/U70g1pFk=", "test123", UserRole.SUPPLIER);
		this.users[2] = new User(2, "Michael", "Jordan", "michael.jordan@ezwh.com", "NQzIIM1qR4oF+f3a3k0cvcJMSaO7/7OykM/U70g1pFk=", "test123", UserRole.SUPPLIER);
		this.users[3] = new User(3, "Michael", "Scott", "michael.scott@ezwh.com", "NQzIIM1qR4oF+f3a3k0cvcJMSaO7/7OykM/U70g1pFk=", "test123", UserRole.MANAGER);
	}

	updateUser(id) {
		// push this.SKUs[id] to the DB
	}

	getUsers() {
		return this.users;
	}

	addUser(id, user) {
		// TODO database
		this.users[id] = user;
	}
}

exports.DatabaseHelper = DatabaseHelper;
