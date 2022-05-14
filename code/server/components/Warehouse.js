const dayjs = require("dayjs");
const crypto = require("crypto");

const {DatabaseHelper} = require("../database/DatabaseHelper");
const SKU = require("./SKU");
const SKUItem = require("./SKUItem");
const Position = require("./Position")
const {UserRole, User} = require("./User");
const {TestDescriptor} = require("./TestDescriptor");
const {TestResult} = require("./TestResult");

class Warehouse {
	constructor(dbFile="./database/ezwh.db") {
		this.db_help = new DatabaseHelper(dbFile);
	}


	/** SKU **/
	async getSKUs() {
		try {
			let skus = await this.db_help.loadSKUs();
			for (let sku of skus) {
				const testIDs = await this.db_help.selectTestDescriptorsIDBySKUID(sku.getId());
				sku.setTestDescriptors(testIDs);
			}
			return {status: 200, body: skus};
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	async getSKUbyId(id) {
		try {
			let sku = await this.db_help.loadSKUbyID(id);
			if (!sku) return {status: 404, body: "sku not found"};
			const testIDs = await this.db_help.selectTestDescriptorsIDBySKUID(sku.getId());
			sku.setTestDescriptors(testIDs);
			return {status: 200, body: sku};
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	async createSKU(description, weight, volume, notes, price, quantity) {
		try {
			let newSKU = new SKU(null, description, weight, volume, price, notes, quantity);
			await this.db_help.storeSKU(newSKU);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}

	async updateSKU(id, positionId , newDescription = undefined, newWeight = undefined, newVolume = undefined, newNotes = undefined, newPrice = undefined, newAvailableQuantity = undefined) {
		try {
			const sku = await this.db_help.loadSKUbyID(id);
			if (!sku) return {status: 404, body: "sku not found"};
			let oldPosition = undefined;
			if(sku.getPosition() != null)
				oldPosition =  await this.db_help.loadPositionByID(sku.getPosition());
			if (positionId !== undefined) { //ONLY POSITION
				const newPosition = await this.db_help.loadPositionByID(positionId);
				if(!newPosition) return {status: 404, body: "position not found"};
				if (newPosition.getOccupiedWeight() + sku.getWeight() >  newPosition.getMaxWeight() ||
					newPosition.getOccupiedVolume() + sku.getVolume() > newPosition.getMaxVolume())
						return {status: 422, body: "Can't move sku in that position"};
				sku.setPosition(positionId);
				newPosition.addOccupiedWeight(sku.getWeight());
				newPosition.addOccupiedVolume(sku.getVolume());
				this.db_help.updatePosition(newPosition.getPositionID(), newPosition);
			} else {
				sku.setDescription(newDescription);
				sku.setWeight(newWeight);
				sku.setVolume(newVolume);
				sku.setPrice(newPrice);
				sku.setNotes(newNotes);
				sku.setAvailableQuantity(newAvailableQuantity);
			}
			if (oldPosition != undefined) {
				oldPosition.subOccupiedWeight(sku.getWeight());
				oldPosition.subOccupiedVolume(sku.getVolume());
				this.db_help.updatePosition(oldPosition.getPositionID(), oldPosition);
			}
			this.db_help.updateSKU(sku);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e}
		}
	}

	deleteSKU(id) { 
		return this.db_help.deleteSKU(id);
	}

	/** SKU Item **/
	async getSKUItems() {
		//TODO: USER PERMISSIONS
		let SKUItems;
		try {
			SKUItems = await this.db_help.loadSKUItem();
		} catch (e) {
			return { status: 500, body: {}, message: e };
		}

		return { status: 200, body: SKUItems };

	}//: List<SKUItem>

	getSKUItems() {
		return this.db_help.loadSKUItems();
	}

	getSKUItemsBySKUID(skuid) {
		return this.db_help.loadSKUItemBySKUID(skuid);
	}

	getSKUItemByRFID(rfid) {
		return this.db_help.loadSKUItemByRFID(rfid);
	}

	async createSKUItem(rfid, skuid, dateOfStock) {
		let date;
		if (dateOfStock != null && !(date = dayjs(dateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
			return { status: 422, body: "Date isn't in correct format" };
		}
		try {
			const sku = await this.db_help.loadSKUbyID(skuid);
			if (!sku) return {status: 404, body: "sku not found"};
			await this.db_help.storeSKUItem(new SKUItem(rfid, skuid, 0, date));
			return {status: 201, body: ""};
		} catch(e) {
			return {status: 503, body: e};
		}
	}

	async updateSKUItem(rfid, newRFID, newAvailable, newDateOfStock) {
		let date;
		if (newDateOfStock != null && !(date = dayjs(newDateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
			return { status: 422, body: "Date isn't in correct format" };
		}
		try {
			let skuitem = await this.db_help.loadSKUItemByRFID(rfid)
			if (!skuitem) return { status: 404, body: "SkuItem not found" };
			skuitem.setRFID(newRFID);
			skuitem.setDateOfStock((newDateOfStock === null ? newDateOfStock : date));
			skuitem.setAvailable(newAvailable);
			await this.db_help.updateSKUItem(rfid, skuitem);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}

	deleteSKUItem(rfid) {
		return this.db_help.deleteSKUItem(rfid);
	}

	/** Position **/
	getPositions() {
		return this.db_help.loadPositions();
	}

	getPositionById(posID) {
		return this.db_help.loadPositionByID(posID);
	}

	async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
		if (positionID.slice(0, 4) !== aisleID || positionID.slice(4, 8) !== row || positionID.slice(8, 12) !== col)
			return { status: 422, body: "ID isn't coherent with other params"};
		try {
			let newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
			await this.db_help.storePosition(newPosition);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}

	async updatePosition(posID, newPositionID, newAisleID = undefined, newRow = undefined, newCol = undefined, newMaxWeight = undefined, newMaxVolume = undefined, newOccupiedWeight = undefined, newOccupiedVolume = undefined) {
		try {
			let position = await this.db_help.loadPositionByID(posID);
			if (!position) return { status: 404, body: "position not found" };
			if (newAisleID !== undefined) {
				let newPosID = newAisleID+newRow+newCol;
				position.setPositionID(newPosID);
				position.setAisleID(newAisleID);
				position.setRow(newRow);
				position.setCol(newCol);
				position.setMaxWeight(newMaxWeight);
				position.setMaxVolume(newMaxVolume);
				position.setOccupiedWeight(newOccupiedWeight);
				position.setOccupiedVolume(newOccupiedVolume);
			} else {
				position.setPositionID(newPositionID);
				position.setAisleID(newPositionID.slice(0, 4));
				position.setRow(newPositionID.slice(4, 8));
				position.setCol(newPositionID.slice(8, 12));
			}
			await this.db_help.updatePosition(posID, position);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}

	deletePosition(posID) {
		return this.db_help.deletePosition(posID);
	}

	/** Test Descriptor **/
	getTestDescriptors() {
		return this.db_help.selectTestDescriptors();
	}

	getTestDescriptorByID(id) {
		return this.db_help.selectTestDescriptorByID(id);
	}

	async newTestDescriptor(name, procedureDescription, idSKU) {
		try {
			const SKU = await this.db_help.selectSKUbyID(idSKU);
			if (!SKU) return {status: 404, body: "sku not found"};
			await this.db_help.insertTestDescriptor(new TestDescriptor(null, name, procedureDescription, idSKU));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	async modifyTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
		try {
			const testDescriptor = await this.db_help.selectTestDescriptorByID(id);
			if (!testDescriptor) return {status: 404, body: "id not found"};
			const SKU = await this.db_help.selectSKUbyID(newIdSKU);
			if (!SKU) return {status: 404, body: "sku not found"};

			testDescriptor.name = newName;
			testDescriptor.procedureDescription = newProcedureDescription;
			testDescriptor.idSKU = newIdSKU;
			await this.db_help.updateTestDescriptor(testDescriptor);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	deleteTestDescriptor(id) {
		return this.db_help.deleteTestDescriptorByID(id);
	}

	/** Test Result **/
	async getTestResults(rfid) {
		try {
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResults = await this.db_help.selectTestResults(rfid);
			return {status: 200, body: testResults.map((tr) => ({id: tr.id, idTestDescriptor: tr.idTestDescriptor, Date: tr.date, Result: tr.result}))};
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	async getTestResultByID(rfid, id) {
		try {
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResult = await this.db_help.selectTestResultByID(rfid, id);
			if (testResult) {
				return {status:200, body: {id: testResult.id, idTestDescriptor: testResult.idTestDescriptor, Date: testResult.date, Result: testResult.result}}
			} else {
				return {status: 404, body: "test result not found"};
			}
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	async newTestResult(rfid, idTestDescriptor, date, result) {
		try {
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testDescriptor = await this.db_help.selectTestDescriptorByID(idTestDescriptor);
			if (!testDescriptor) return {status: 404, body: "test descriptor not found"};
			await this.db_help.insertTestResult(new TestResult(null, idTestDescriptor, date, result, rfid));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	async modifyTestResult(rfid, id, newIdTestDescriptor, newDate, newResult) {
		try {
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResult = await this.db_help.selectTestResultByID(rfid, id);
			if (!testResult) return {status: 404, body: "test result not found"};
			const testDescriptor = await this.db_help.selectTestDescriptorByID(newIdTestDescriptor);
			if (!testDescriptor) return {status: 404, body: "test descriptor not found"};

			testResult.idTestDescriptor = newIdTestDescriptor;
			testResult.date = newDate;
			testResult.result = newResult;
			await this.db_help.updateTestResult(testResult);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	deleteTestResult(rfid, id) {
		return this.db_help.deleteTestResultByID(rfid, id);
	}

	/** User **/
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
