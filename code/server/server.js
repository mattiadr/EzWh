'use strict';
const express = require('express');
const {body, param, validationResult} = require('express-validator');

const {Warehouse} = require("./components/Warehouse");
const {UserRole} = require("./components/User");

// init express
const app = new express();
const port = 3001;

const wh = new Warehouse();

app.use(express.json());


/** SKU **/

/* GET */
app.get('/api/skus',
	async (req, res) => {
		let result = await wh.getSKUs();
		if (result.status === 200)
			return res.status(result.status).json(result.body.map((s) => ({id: s.id, description: s.description, weight: s.weight, volume: s.volume, notes: s.notes, position: s.position, availableQuantity: s.availableQuantity, price:  s.price, testDescriptors: s.testDescriptors})));
		return res.status(result.status).send(result.body);
});
app.get('/api/skus/:id',
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		let result = await wh.getSKUbyId(req.params.id);
		if (result.status === 200)
			return res.status(result.status).json({id: result.body.id, description: result.body.description, weight: result.body.weight, volume: result.body.volume, notes: result.body.notes, position: result.body.position, availableQuantity: result.body.availableQuantity, price:  result.body.price, testDescriptors: result.body.testDescriptors});
		return res.status(result.status).send(result.body);
});

/* POST */
app.post('/api/sku',
	body("description").exists(),
	body("weight").isInt(),
	body("volume").isInt(),
	body("notes").exists(),
	body("price").isFloat(),
	body("availableQuantity").isInt(),
	async (req, res) => {
		if(!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await wh.createSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
		return res.status(result.status).json(result.body);
});

/* PUT */
app.put('/api/sku/:id',
	param("id").isInt(),
	body("newDescription").exists(),
	body("newWeight").isInt(),
	body("newVolume").isInt(),
	body("newNotes").exists(),
	body("newPrice").isFloat(),
	body("newAvailableQuantity").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await wh.updateSKU(req.params.id, undefined, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity);
		return res.status(result.status).json(result.message);
});
app.put('/api/sku/:id/position',
	param("id").isInt(),
	body("position").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await wh.updateSKU(req.params.id, req.body.position);
		return res.status(result.status).json(result.message);
});

/* DELETE */
app.delete('/api/skus/:id',
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteSKU(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** SKU Item **/

/* GET */
app.get('/api/skuitems',
	(req, res) => {
		wh.getSKUItems().then((skuitems) => {
			res.status(200).json(skuitems.map((si) => ({RFID: si.RFID, SKUId: si.SKUID, Available: si.available, DateOfStock: si.dateOfStock})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get('/api/skuitems/sku/:id',
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid skuID");
		wh.getSKUItemsBySKUID(req.params.id).then((si) => {
			if (si) res.status(200).json({RFID: si.RFID, SKUId: si.SKUID, DateOfStock: si.dateOfStock});
			else res.status(404).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get('/api/skuitems/:rfid',
	param("rfid").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid rfid");
		wh.getSKUItemByRFID(req.params.rfid).then((si) => {
			if (si) res.status(200).json({RFID: si.RFID, SKUId: si.SKUID, Available: si.available, DateOfStock: si.dateOfStock});
			else res.status(404).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post('/api/skuitem',
	body("RFID").exists(),
	body("SKUId").isInt(),
	body("DateOfStock").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await wh.createSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock);
		return res.status(result.status).json(result.body);
});

/* PUT */
app.put('/api/skuitems/:rfid',
	param("rfid").exists(),
	body("newRFID").exists(),
	body("newAvailable").isInt(),
	body("newDateOfStock").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await wh.updateSKUItem(req.params.rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
		return res.status(result.status).json(result.message);
});

/* DELETE */
app.delete('/api/skuitems/:rfid',
	param("rfid").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteSKUItem(req.params.rfid).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** Position **/

/* GET */
app.get('/api/positions',
	(req, res) => {
		wh.getPositions().then((positions) => {
			res.status(200).json(positions.map((p) => ({positionID: p.positionID, aisleID: p.aisleID, row: p.row, col: p.idSKU, maxWeight: p.maxWeight, maxVolume: p.maxVolume, occupiedWeight: p.occupiedWeight, occupiedVolume: p.occupiedVolume})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post('/api/position',
	body("positionID").exists(),
	body("aisleID").exists(),
	body("row").exists(),
	body("col").exists(),
	body("maxWeight").isInt(),
	body("maxVolume").isInt(),
	async (req, res) =>{
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await wh.createPosition(req.body.positionID, req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, req.body.maxVolume);
		return res.status(result.status).json(result.message);
});

/* PUT */
app.put('/api/position/:positionID',
	param("positionID").exists(),
	body("newAisleID").exists(),
	body("newRow").exists(),
	body("newCol").exists(),
	body("newMaxWeight").isInt(),
	body("newMaxVolume").isInt(),
	body("newOccupiedWeight").isInt(),
	body("newOccupiedVolume").isInt(),
	async (req, res) =>{
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await wh.updatePosition(req.params.positionID, undefined, req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume);
		return res.status(result.status).json(result.message);
});
app.put('/api/position/:positionID/changeID',
	param("positionID").exists(),
	body("newPositionID").exists(),
	async (req, res) =>{
		if (!validationResult(req).isEmpty() || req.body.newPositionID.length !== 12) return res.status(422).send("invalid param or body");
		let result = await wh.updatePosition(req.params.positionID, req.body.newPositionID);
		return res.status(result.status).json(result.message);
});

/* DELETE */
app.delete('/api/position/:positionID',
	param("positionID").exists(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid positionID");
		wh.deletePosition(req.params.positionID).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** Test Descriptor **/

/* GET */
app.get("/api/testDescriptors",
	(req, res) => {
		wh.getTestDescriptors().then((testDescriptors) => {
			res.status(200).json(testDescriptors.map((td) => ({id: td.id, name: td.name, procedureDescription: td.procedureDescription, idSKU: td.idSKU})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/testDescriptors/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getTestDescriptorByID(req.params.id).then((td) => {
			if (td) {
				res.status(200).json({id: td.id, name: td.name, procedureDescription: td.procedureDescription, idSKU: td.idSKU});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post("/api/testDescriptor",
	body("name").exists(),
	body("procedureDescription").exists(),
	body("idSKU").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.createTestDescriptor(req.body.name, req.body.procedureDescription, req.body.idSKU);
		return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/testDescriptor/:id",
	param("id").isInt(),
	body("newName").exists(),
	body("newProcedureDescription").exists(),
	body("newIdSKU").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		const result = await wh.updateTestDescriptor(req.params.id, req.body.newName, req.body.newProcedureDescription, req.body.newIdSKU);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/testDescriptor/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteTestDescriptor(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** Test Result **/

/* GET */
app.get("/api/skuitems/:rfid/testResults",
	param("rfid").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid rfid");
		const result = await wh.getTestResults(req.params.rfid);
		return res.status(result.status).json(result.body);
});
app.get("/api/skuitems/:rfid/testResults/:id",
	param("rfid").exists(),
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid params");
		const result = await wh.getTestResultByID(req.params.rfid, req.params.id);
		return res.status(result.status).json(result.body);
});

/* POST */
app.post("/api/skuitems/testResult",
	body("rfid").exists(),
	body("idTestDescriptor").isInt(),
	body("Date").isDate(),
	body("Result").isBoolean(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.createTestResult(req.body.rfid, req.body.idTestDescriptor, req.body.Date, req.body.Result);
		return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/skuitems/:rfid/testResult/:id",
	param("rfid").exists(),
	param("id").isInt(),
	body("newIdTestDescriptor").isInt(),
	body("newDate").isDate(),
	body("newResult").isBoolean(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid params or body");
		const result = await wh.updateTestResult(req.params.rfid, req.params.id, req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/skuitems/:rfid/testResult/:id",
	param("rfid").exists(),
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid params");
		wh.deleteTestResult(req.params.rfid, req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(503).send(err);
		});
});


/** User **/

/* GET */
app.get("/api/userinfo",
	(req, res) => {
		const user = wh.getCurrentUser();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname, type: user.role});
});
app.get("/api/suppliers",
	(req, res) => {
		wh.getUsersByRole(UserRole.SUPPLIER).then((suppliers) => {
			res.status(200).json(suppliers.map((s) => ({id: s.id, name: s.name, surname: s.surname, email: s.email})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/users",
	(req, res) => {
		wh.getUsers().then((users) => {
			res.status(200).json(users.map((u) => ({id: u.id, name: u.name, surname: u.surname, email: u.email, type: u.role})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post("/api/newUser",
	body("username").isEmail(),
	body("password").isLength({min: 8}),
	async (req, res) => {
		const result = await wh.createUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.type);
		return res.status(result.status).send(result.body);
});
app.post("/api/managerSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await wh.session(req.body.username, req.body.password, UserRole.MANAGER);
		return res.status(result.status).json(result.body);
});
app.post("/api/customerSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await wh.session(req.body.username, req.body.password, UserRole.CUSTOMER);
		return res.status(result.status).json(result.body);
});
app.post("/api/supplierSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await wh.session(req.body.username, req.body.password, UserRole.SUPPLIER);
		return res.status(result.status).json(result.body);
});
app.post("/api/clerkSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await wh.session(req.body.username, req.body.password, UserRole.CLERK);
		return res.status(result.status).json(result.body);
});
app.post("/api/qualityEmployeeSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await wh.session(req.body.username, req.body.password, UserRole.QUALITY_CHECKER);
		return res.status(result.status).json(result.body);
});
app.post("/api/deliveryEmployeeSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await wh.session(req.body.username, req.body.password, UserRole.DELIVERY);
		return res.status(result.status).json(result.body);
});
app.post("/api/logout",
	(req, res) => {
		wh.logout();
		return res.status(200).end();
});

/* PUT */
app.put("/api/users/:username",
	param("username").isEmail(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const result = await wh.updateUserRights(req.params.username, req.body.oldType, req.body.newType);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/users/:username/:type",
	param("username").isEmail(),
	param("type").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing params");
		const result = await wh.deleteUser(req.params.username, req.params.type);
		return res.status(result.status).send(result.body);
});


/** Return Order **/

/* GET */
app.get("/api/returnOrders",
	(req, res) => {
		wh.getReturnOrders().then((returnOrders) => {
			res.status(200).json(returnOrders.map((ro) => ({returnOrderId: ro.returnOrderId, returnDate: ro.returnDate, restockOrderId: ro.restockOrderId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/returnOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getReturnOrderByID(req.params.id).then((ro) => {
			if (ro) {
				res.status(200).json({returnOrderId: ro.returnOrderId, returnDate: ro.returnDate, restockOrderId: ro.restockOrderId});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post("/api/returnOrder",
	body("returnDate").exists(),
	body("products").isArray(),
	body("restockOrderId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.newReturnOrder(req.body.returnDate, req.body.restockOrderId);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/returnOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteReturnOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** Return Order Product **/

/* GET */
app.get("/api/returnOrderProducts",
(req, res) => {
	wh.getReturnOrderProducts().then((returnOrderProducts) => {
		res.status(200).json(returnOrderProducts.map((rop) => ({returnOrderId: rop.returnOrderId, ITEMID: rop.ITEMID, price: rop.price})));
	}).catch((err) => {
		res.status(500).send(err);
	});
});
app.get("/api/returnOrderProducts/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getReturnOrderProductById(req.params.id).then((rop) => {
			if (rop) {
				res.status(200).json({returnOrderId: rop.returnOrderId, ITEMID: rop.ITEMID, price: rop.price});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post("/api/returnOrderProduct",
body("price").exists(),
async (req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
	const result = await wh.createReturnOrderProduct(req.body.price);
	return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/returnOrderProducts/:id",
param("id").isInt(),
async (req, res) => {
	if (!req.is("application/json")) return res.status(422).send("malformed body");
	if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
	const result = await wh.updateReturnOrderProduct(req.params.returnOrderId, req.params.ITEMID, req.body.price);
	return res.status(result.status).send(result.body);
	});

/* DELETE */
app.delete("/api/returnOrderProduct/:id",
param("id").isInt(),
(req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
	wh.deleteReturnOrderProduct(req.params.returnOrderId).then(() => {
		res.status(204).end();
	}).catch((err) => {
		res.status(500).send(err);
	});
});


/** Internal Order */

/* GET */
app.get("/api/internalOrders",
	(req, res) => {
		wh.getInternalOrders().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/internalOrdersIssued",
	(req, res) => {
		wh.getInternalOrdersIssued().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/internalOrdersAccepted",
	(req, res) => {
		wh.getInternalOrdersAccepted().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/internalOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getInternalOrderByID(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post("/api/internalOrder",
	body("issueDate").exists(),
	body("customerId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.newInternalOrder(req.body.issueDate, 'issued', req.body.customerId);
		return res.status(result.status).send(result.body);
	});

/* PUT */
app.put("/api/internalOrders/:id",
	param("id").isInt(),
	body("newState").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		const result = await wh.updateInternalOrder(req.params.id, req.body.newState);
		return res.status(result.status).send(result.body);
	});

/* DELETE */
app.delete("/api/internalOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteInternalOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
	});


/** Internal Order Product **/

/* GET */
app.get("/api/internalOrderProducts",
(req, res) => {
	wh.getInternalOrderProducts().then((internalOrderProducts) => {
		res.status(200).json(internalOrderProducts.map((iop) => ({internalOrderId: iop.internalOrderId, ITEMID: iop.ITEMID, quantity: iop.quantity})));
	}).catch((err) => {
		res.status(500).send(err);
	});
});
app.get("/api/internalOrderProducts/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getInternalOrderProductById(req.params.id).then((iop) => {
			if (iop) {
				res.status(200).json({returnOrderId: iop.returnOrderId, ITEMID: iop.ITEMID, quantity: iop.quantity});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post("/api/internalOrderProduct",
body("quantity").isInt(),
async (req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
	const result = await wh.createInternalOrderProduct(req.body.internalOrderId, req.body.ITEMID ,req.body.quantity);
	return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/internalOrderProducts/:internalOrderId/:ITEMID",
param("internalOrderId").isInt(),
async (req, res) => {
	if (!req.is("application/json")) return res.status(422).send("malformed body");
	const result = await wh.updateInternalOrderProduct(req.params.internalOrderId, req.params.ITEMID, req.body.quantity);
	return res.status(result.status).send(result.body);
	});

/* DELETE */
app.delete("/api/internalOrderProduct/:internalOrderId",
param("internalOrderId").isInt(),
(req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
	wh.deleteInternalOrderProduct(req.params.internalOrderId).then(() => {
		res.status(204).end();
	}).catch((err) => {
		res.status(500).send(err);
	});
});


/** Item */

/* GET */
app.get("/api/items",
	(req, res) => {
		wh.getItems().then((Items) => {
			res.status(200).json(Items.map((io) => ({ITEMID: io.ITEMID, description: io.description, price: io.price, SKUID: io.SKUID, supplierId: io.supplierId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/items/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getItemByID(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({ITEMID: io.ITEMID, description: io.description, price: io.price, SKUID: io.SKUID, supplierId: io.supplierId});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
app.post("/api/item",
	body("description").exists(),
	body("price").exists(),
	body("SKUId").exists(),
	body("supplierId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.createItem(req.body.description, req.body.price, req.body.SKUId, req.body.supplierId);
		return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/item/:id",
	param("id").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const result = await wh.updateItem(req.params.ITEMID, req.params.description, req.params.price, req.params.SKUId, req.params.supplierId);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/items/:id",
	param("id").exists(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteItem(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** Restock Order **/

/* GET */
app.get("/api/restockOrders",
	(req, res) => {
		wh.getRestockOrders().then((restockOrders) => {
			res.status(200).json(restockOrders.map((io) => ({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
app.get("/api/restockOrdersIssued",
	(req, res) => {
		wh.getRestockOrdersIssued().then((restockOrders) => {
			res.status(200).json(restockOrders.map((io) => ({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems})));
		}).catch((err) => {
			res.status(500).send(err);
		});
	});
app.get("/api/restockOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getRestockOrderByID(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

app.get("/api/restockOrders/:id/returnItems",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getProducts(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({skuItems: io.skuItems});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
	});

/* POST */
app.post("/api/restockOrder",
	body("issueDate").exists(),
	body("supplierId").isInt(),
	body("products").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.createRestockOrder(req.body.issueDate, req.body.state, req.body.supplierId, req.body.transportNote, req.body.skuItems);
		return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/restockOrders/:id",
	param("id").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const ro = wh.getRestockOrderByID(req.params.id);
		const result = await wh.updateRestockOrder(req.params.id, ro.issueDate, ro.state, ro.supplierId, ro.transportNote, ro.skuItems);
		return res.status(result.status).send(result.body);
});

app.put("/api/restockOrder/:id/skuItems",
	param("id").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const ro = wh.getRestockOrderByID(req.params.id);
		const result = await wh.addProducts(ro, req.body.skuItems);
		return res.status(result.status).send(result.body);
	});

/* DELETE */
app.delete("/api/restockOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteRestockOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
