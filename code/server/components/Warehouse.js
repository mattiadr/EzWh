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

	makeid(length) {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	/*----------------------------SKU-----------------------------------*/

	async getSKUs() {
		//TODO: USER PERMISSIONS
		let SKUs;
		try {
			SKUs = await this.db_help.loadSKU();
		} catch (e) {
			return { status: 500, body: {}, message: e };
		}

		return { status: 200, body: SKUs };
	} //: List<SKU>

	async getSKUbyId(id /*: String*/) {
		if (typeof id !== 'string')
			return { status: 422, body: {}, message: {} };
		let skus;
		try {
			skus = await this.getSKUs();
			if (skus.body.size == 0 || skus.body.get(id) == undefined)
				return { status: 404, body: {}, message: {} };

		} catch (e) {
			return { status: 500, body: {}, message: {} };
		}
		return { status: 200, body: skus.body.get(id), message: {} };
	} //: SKU

	async createSKU(description /*: String*/, weight /*: double*/, volume /*: double*/, notes /*: string*/, price /*: double*/, quantity /*: Integer*/) {
		if (typeof description !== 'string' || typeof weight !== 'number' || typeof volume !== 'number' ||
			typeof notes !== 'string' || typeof price !== 'number' || typeof quantity != 'number')
			return { status: 422, body: {}, message: {} };

		try {
			let newSKUid = this.makeid(12);
			let skus = await this.db_help.loadSKU();
			if (skus.size != 0)
				while (skus.has(newSKUid))
					newSKUid = this.makeid(12);
			let newSKU = new SKU(newSKUid, description, weight, volume, price, notes, quantity);
			await this.db_help.storeSKU(newSKU);
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 201, body: {} };
	}

	async deleteSKU(id /*: String*/) {
		if (typeof id !== 'string')
			return { status: 422, body: {}, message: typeof id };
		try {
			let sku = await this.getSKUbyId(id);
			if (sku.status == 404) return { status: 404, body: {}, message: {} };
			await this.db_help.deleteSKU(id);
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 204, body: {}, message: {} };
	}//: void

	async updateSKU(id /*:String*/, positionId /*String*/, description = "" /*: String*/, weight=-1 /*: double*/, volume=-1 /*: double*/, notes = "" /*: string*/, price = -1 /*: double*/, quantity = -1 /*: Integer*/) {
		//TODO: UPDATE POSITION FIELDS!!!
		if (typeof id !== 'string' || typeof description !== 'string' || typeof weight !== 'number' || typeof volume !== 'number' ||
			typeof notes !== 'string' || typeof price !== 'number' || typeof quantity != 'number')
			return { status: 422, body: {}, message: {} };
		try {
			let sku = await this.getSKUbyId(id);
			if (sku.status == 404) return { status: 404, body: {}, message: {} };
			if (positionId === undefined) {
				let position = sku.body.getPosition();
				if ( position != null)
					this.updatePosition(position.getPositionID(), position.getAisleID(), position.getRow(), position.getCol(), position.getMaxWeight(), position.getMaxVolume(), position.getOccupiedWeight()+weight, position.getOccupiedVolume()+volume);
				await this.db_help.updateSKU(new SKU(id, description, weight, volume, price, notes, quantity));
			} else {
				let position = await this.getPositionById(positionId);
				if (position.status == 404) return { status: 404, body: {}, message: {} };
				this.updatePosition(position.body.getPositionID(), position.body.getAisleID(), position.body.getRow(), position.body.getCol(), position.body.getMaxWeight(), position.body.getMaxVolume(), position.body.getOccupiedWeight()+sku.body.getWeight(), position.body.getOccupiedVolume()+sku.body.getVolume());
				let oldPosition = sku.body.getPosition();
				if ( oldPosition != null)
					this.updatePosition(oldPosition.getPositionID(), oldPosition.getAisleID(), oldPosition.getRow(), oldPosition.getCol(), oldPosition.getMaxWeight(), oldPosition.getMaxVolume(), oldPosition.getOccupiedWeight()-sku.body.getWeight(), oldPosition.getOccupiedVolume()-sku.body.getVolume());
				await this.db_help.updateSKU(new SKU(id, sku.body.getDescription(), sku.body.getWeight(), sku.body.getVolume(), sku.body.getPrice(), sku.body.getNotes(), sku.body.getAvailableQuantity(), positionId));
			}
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 200, body: {}, message: {} };
	}//: void

	/*--------------------------------SKUItem-----------------------------------*/

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

	async getSKUItemsBySKU(SKUID /*: String*/) {
		if (typeof SKUID !== 'string')
			return { status: 422, body: {}, message: {} };
		let skuitems = [];
		try {
			await (await this.getSKUItems()).body.forEach((value, key) => { value.SKUID == SKUID && value.available == 1 ? skuitems.push(value) : {} });
			if (skuitems.length == 0)
				return { status: 404, body: {}, message: {} };

		} catch (e) {
			return { status: 500, body: {}, message: {} };
		}
		return { status: 200, body: skuitems, message: {} };
	}//: List<SKUItem>

	async getSKUItemByRFID(rfid /*: String*/) {
		if (typeof rfid !== 'string')
			return { status: 422, body: {}, message: {} };
		let skuitems;
		try {
			skuitems = await this.getSKUItems();
			if (skuitems.body.size == 0 || skuitems.body.get(rfid) == undefined)
				return { status: 404, body: {}, message: {} };

		} catch (e) {
			return { status: 500, body: {}, message: {} };
		}
		return { status: 200, body: skuitems.body.get(rfid), message: {} };

	} //: SKUItem

	async createSKUItem(rfid /*: String*/, skuid /*: String*/, dateOfStock /*: String*/) {
		if (typeof rfid !== 'string' || typeof skuid !== 'string' || typeof dateOfStock !== 'string')
			return { status: 422, body: {}, message: {} };

		let date;
		if (dateOfStock != null && !(date = dayjs(dateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
			return { status: 422, body: {}, message: {} };
		}
		try {
			let newSKUItem = new SKUItem(rfid, skuid, 0, date);
			await this.db_help.storeSKUItem(newSKUItem);
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 201, body: {} };
	}//: void

	async updateSKUItem(rfid /*: String*/, newRFID, newAvailable, newDateOfStock) {
		//TODO: UPDATE POSITION FIELDS!!!
		if (typeof rfid !== 'string' || typeof newRFID !== 'string' || typeof newAvailable !== 'number' || typeof newDateOfStock !== 'string')
			if (newAvailable !== 1 || newAvailable !== 0)
				return { status: 422, body: {}, message: {} };
		let date;
		if (newDateOfStock != null && !(date = dayjs(newDateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
			return { status: 422, body: {}, message: {} };
		}
		try {
			let skuitem = await this.getSKUItemByRFID(rfid);
			if (skuitem.status == 404) return { status: 404, body: {}, message: {} };
			await this.db_help.updateSKUItem(rfid, new SKUItem(newRFID, skuitem.body.getSKUId(), newAvailable, date));
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 200, body: {}, message: {} };
	}//: void

	async deleteSKUItems(rfid /*: String*/) {
		if (typeof rfid !== 'string')
			return { status: 422, body: {}, message: typeof id };
		try {
			let skuitem = await this.getSKUItemByRFID(rfid);
			if (skuitem.status == 404) return { status: 404, body: {}, message: {} };
			await this.db_help.deleteSKUItem(rfid);
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 204, body: {}, message: {} };
	}// : void

	/*----------------------------Position------------------------------------*/

	async getPositions() {
		//TODO: USER PERMISSIONS
		let Positions;
		try {
			Positions = await this.db_help.loadPosition();
		} catch (e) {
			return { status: 500, body: {}, message: e };
		}

		return { status: 200, body: Positions };

	}

	async createPosition(positionID /*: String*/, aisleID /*: String*/, row /*: String*/, col /*: String*/, maxWeight /*: Integer*/, maxVolume /*: Integer*/) {
		if (typeof positionID !== 'string' || typeof aisleID !== 'string' || typeof row !== 'string' ||
			typeof col !== 'string' || typeof maxWeight !== 'number' || typeof maxVolume != 'number')
			return { status: 422, body: {}, message: {} };
		if (positionID.slice(0, 4) !== aisleID || positionID.slice(4, 8) !== row || positionID.slice(8, 12) !== col)
			return { status: 422, body: {}, message: {} };

		try {
			let newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
			await this.db_help.storePosition(newPosition);
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 201, body: {} };
	}

	async getPositionById(posID) {
		let positions;
		try {
			positions = await this.getPositions();
			if (positions.body.size == 0 || positions.body.get(posID) == undefined)
				return { status: 404, body: {}, message: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 200, body: positions.body.get(posID), message: {} };
	}

	async updatePosition(posID /*: String*/, newAisleID, newRow, newCol, newMaxWeight = undefined, newMaxVolume = undefined, newOccupiedWeight = undefined, newOccupiedVolume = undefined) {
		if (typeof posID !== 'string' || typeof newAisleID !== 'string' || typeof newRow !== 'string'|| typeof newCol !== 'string')
				return { status: 422, body: {}, message: {} };
		let newPosID = newAisleID+newRow+newCol;
		try {
			let position = await this.getPositionById(posID);
			if (position.status == 404) return { status: 404, body: {}, message: {} };
			if (newMaxWeight !== undefined)
				await this.db_help.updatePosition(posID, new Position(newPosID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume));
			else
				await this.db_help.updatePosition(posID, new Position(newPosID, newAisleID, newRow, newCol, position.body.getMaxWeight(), position.body.getMaxVolume(), position.body.getOccupiedWeight(), position.body.getOccupiedVolume()));
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 200, body: {}, message: {} };
	}//: void

	async deletePosition(posID /*: String*/) {
		if (typeof posID !== 'string')
			return { status: 422, body: {}, message: typeof id };
		try {
			let skuitem = await this.getPositionById(posID);
			if (skuitem.status == 404) return { status: 404, body: {}, message: {} };
			await this.db_help.deletePosition(posID);
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
		return { status: 204, body: {}, message: {} };
	}// : void

	/** TEST DESCRIPTOR **/
	getTestDescriptors() {
		return this.db_help.selectTestDescriptors();
	}

	getTestDescriptorByID(id) {
		return this.db_help.selectTestDescriptorByID(id);
	}

	async newTestDescriptor(name, procedureDescription, idSKU) {
		try {
			const SKU = await this.db_help.selectSKUbyID(idSKU); // TODO merge
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
			const SKU = await this.db_help.selectSKUbyID(newIdSKU); // TODO merge
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

	/** TEST RESULT **/
	async getTestResults(rfid) {
		try {
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid); // TODO merge
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResults = await this.db_help.selectTestResults(rfid);
			return {status: 200, body: testResults.map((tr) => ({id: tr.id, idTestDescriptor: tr.idTestDescriptor, Date: tr.date, Result: tr.result}))};
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	async getTestResultByID(rfid, id) {
		try {
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid); // TODO merge
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
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid); // TODO merge
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
			const SKUItem = await this.db_help.selectSKUItemByRFID(rfid); // TODO merge
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
