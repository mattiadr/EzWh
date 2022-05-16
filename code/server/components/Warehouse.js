const dayjs = require("dayjs");
const crypto = require("crypto");

const {DatabaseHelper} = require("../database/DatabaseHelper");
const SKU = require("./SKU");
const SKUItem = require("./SKUItem");
const Position = require("./Position")
const {UserRole, User} = require("./User");
const {TestDescriptor} = require("./TestDescriptor");
const {TestResult} = require("./TestResult");
const ReturnOrder = require("./ReturnOrder")
const InternalOrder = require("./InternalOrder");
const RestockOrder = require("./RestockOrder");
const RestockOrderProduct = require("./RestockOrderProduct");

class Warehouse {
	constructor(dbFile="./database/ezwh.db") {
		this.db_help = new DatabaseHelper(dbFile);
	}


	/** SKU **/
	async getSKUs() {
		try {
			let skus = await this.db_help.selectSKUs();
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
			let sku = await this.db_help.selectSKUbyID(id);
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
			await this.db_help.insertSKU(newSKU);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}

	async updateSKU(id, positionId , newDescription = undefined, newWeight = undefined, newVolume = undefined, newNotes = undefined, newPrice = undefined, newAvailableQuantity = undefined) {
		try {
			const sku = await this.db_help.selectSKUbyID(id);
			if (!sku) return {status: 404, body: "sku not found"};
			let oldPosition = undefined;
			if(sku.getPosition() != null)
				oldPosition =  await this.db_help.selectPositionByID(sku.getPosition());
			if (positionId !== undefined) { //ONLY POSITION
				const newPosition = await this.db_help.selectPositionByID(positionId);
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
			if (oldPosition !== undefined) {
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
		return this.db_help.selectSKUItems();
	}

	getSKUItemsBySKUID(skuid) {
		return this.db_help.selectSKUItemBySKUID(skuid);
	}

	getSKUItemByRFID(rfid) {
		return this.db_help.selectSKUItemByRFID(rfid);
	}

	async createSKUItem(rfid, skuid, dateOfStock) {
		let date;
		if (dateOfStock != null && !(date = dayjs(dateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
			return { status: 422, body: "Date isn't in correct format" };
		}
		try {
			const sku = await this.db_help.selectSKUbyID(skuid);
			if (!sku) return {status: 404, body: "sku not found"};
			await this.db_help.insertSKUItem(new SKUItem(rfid, skuid, 0, date));
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
			let skuitem = await this.db_help.selectSKUItemByRFID(rfid)
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
		return this.db_help.selectPositions();
	}

	getPositionById(posID) {
		return this.db_help.selectPositionByID(posID);
	}

	async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
		if (positionID.slice(0, 4) !== aisleID || positionID.slice(4, 8) !== row || positionID.slice(8, 12) !== col)
			return { status: 422, body: "ID isn't coherent with other params"};
		try {
			let newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
			await this.db_help.insertPosition(newPosition);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}

	async updatePosition(posID, newPositionID, newAisleID = undefined, newRow = undefined, newCol = undefined, newMaxWeight = undefined, newMaxVolume = undefined, newOccupiedWeight = undefined, newOccupiedVolume = undefined) {
		try {
			let position = await this.db_help.selectPositionByID(posID);
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

	async createTestDescriptor(name, procedureDescription, idSKU) {
		try {
			const SKU = await this.db_help.selectSKUbyID(idSKU);
			if (!SKU) return {status: 404, body: "sku not found"};
			await this.db_help.insertTestDescriptor(new TestDescriptor(null, name, procedureDescription, idSKU));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	async updateTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
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

	async createTestResult(rfid, idTestDescriptor, date, result) {
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

	async updateTestResult(rfid, id, newIdTestDescriptor, newDate, newResult) {
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

	getUsers() {
		return this.db_help.selectUsers().then((users) => users.filter((u) => u.role !== UserRole.MANAGER));
	}

	getUsersByRole(role) {
		return this.db_help.selectUsers().then((users) => users.filter((u) => u.role === role));
	}

	async createUser(email, name, surname, password, type) {
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

	logout() {
		// TODO
		return true;
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

	/** Return Order **/
	getReturnOrders() {
		return this.db_help.selectReturnOrders();
	}

	getReturnOrderByID(id) {
		return this.db_help.selectReturnOrderByID(id);
	}

	async newReturnOrder(returnDate, products, restockOrderId) {
		try {
			await this.db_help.insertReturnOrder(new ReturnOrder(null, returnDate, products, restockOrderId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	deleteReturnOrder(id) {
		return this.db_help.deleteReturnOrder(id);
	}

	/** Internal Order **/
	getInternalOrders() {
		return this.db_help.selectInternalOrders();
	}

	getInternalOrdersIssued() {
		return this.db_help.selectInternalOrdersIssued();
	}

	getInternalOrdersAccepted() {
		return this.db_help.selectInternalOrdersAccepted();
	}

	getInternalOrderByID() {
		return this.db_help.selectInternalOrderByID();
	}

	async newInternalOrder(issueDate, state, products, customerId) {
		try {
			await this.db_help.insertInternalOrder(new InternalOrder(null, issueDate, state, products, customerId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	deleteInternalOrder(id) {
		return this.db_help.deleteInternalOrder(id);
	}

	/* Item */

	getItemById(itemID) {
		return this.db_help.selectItemByID(itemID);
	}

	getItems() {
		return this.db_help.selectItem();
	}

	async createItem(ITEMID, description, price, SKUID, supplierId) {
		try {
			let newItem = new Item(ITEMID, description, price, SKUID, supplierId);
			await this.db_help.insertItem(newItem);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}

	async updateItem(ITEMID, description = undefined, price = undefined, SKUID = undefined, supplierId = undefined) {
		try {
			let item = await this.db_help.selectItemByID(ITEMID);
			if (!item) return { status: 404, body: "item not found" };
			if (ITEMID !== undefined) {
				item.setDescription(description);
				item.setPrice(price);
				item.setSKUID(SKUID);
				item.setSupplierId(supplierId);
			} else {
				item.setItemId(ITEMID);
				item.setDescription(description);
				item.setPrice(price);
				item.setSKUID(SKUID);
				item.setSupplierId(supplierId);
			}
			await this.db_help.updateItem(ITEMID, item);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}

	deleteItem(itemID) {
		return this.db_help.deleteItem(itemID);
	}

	/* Restock Order */

	getRestockOrderById(restockorderID) {
		return this.db_help.selectRestockOrderByID(restockorderID);
	}

	getRestockOrders() {
		return this.db_help.selectRestockOrder();
	}

	async createRestockOrder(ROID,issueDate,state,supplierId,transportNote,skuItems) {
		try {
			let newRestockOrder = new RestockOrder(ROID,issueDate,state,supplierId,transportNote,skuItems);
			await this.db_help.storePosition(newRestockOrder);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}

	async updateItem(ROID,issueDate = undefined,state = undefined,supplierId = undefined,transportNote = undefined,skuItems = undefined) {
		try {
			let restockorder = await this.db_help.selectRestockOrderByID(ROID);
			if (!restockorder) return { status: 404, body: "restock order not found" };
			if (ROID !== undefined) {
				restockorder.setIssueDate(issueDate);
				restockorder.setState(state);
				restockorder.setSupplierId(supplierId);
				restockorder.setTransportNote(transportNote);
				restockorder.setKUItems(skuItems);
			} else {
				restockorder.setItemId(ROID);
				restockorder.setIssueDate(issueDate);
				restockorder.setState(state);
				restockorder.setSupplierId(supplierId);
				restockorder.setTransportNote(transportNote);
				restockorder.setKUItems(skuItems);
			}
			await this.db_help.updateRestockOrder(ROID, restockorder);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}

	deleteRestockOrder(restockorderID) {
		return this.db_help.deleteRestockOrder(restockorderID);
	}
}

exports.Warehouse = Warehouse;
