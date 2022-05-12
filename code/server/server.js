'use strict';
const express = require('express');
const {body, param, validationResult} = require('express-validator');

const {Warehouse} = require("./components/Warehouse");
const {UserRole} = require("./components/User");

// init express
const app = new express();
const port = 3001;

const wh = new Warehouse();

const stripColonFromParam = (param) => {
	return (req, res, next) => {
		req.params[param] = req.params[param].substring(1);
		next();
	}
}

app.use(express.json());


/*----------------------------SKU-----------------------------------*/

//GET /api/skus
app.get('/api/skus', async (req, res) => {
	let skus = await wh.getSKUs();
	let array = [];
	skus.body.forEach((value, key) => array.push(value))
	return res.status(skus.status).json(array);
});

//GET /api/skus/:id
app.get('/api/skus/:id', async (req, res) => {
	let sku = await wh.getSKUbyId(req.params.id);
	return res.status(sku.status).json(sku.body);
});

//POST /api/sku
app.post('/api/sku', async (req, res) => {
	let result = await wh.createSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
	return res.status(result.status).json(result.message);
});

//PUT /api/sku/:id
app.put('/api/sku/:id', async (req, res) => {
	let result = await wh.updateSKU(req.params.id, undefined, req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
	return res.status(result.status).json(result.message);
});

//PUT /api/sku/:id/position
app.put('/api/sku/:id/position', async (req, res) => {
	let result = await wh.updateSKU(req.params.id, req.body.position);
	return res.status(result.status).json(result.message);
});

// DELETE /api/sku/:id
app.delete('/api/sku/:id', async (req, res) => {
	let result = await wh.deleteSKU(req.params.id);
	return res.status(result.status).json(result.message);
});

/*--------------------------------SKUItem-----------------------------------*/

//GET /api/skuitems
app.get('/api/skuitems', async (req, res) => {
	let sku_items = await wh.getSKUItems();
	let array = [];
	sku_items.body.forEach((value, key) => array.push(value))
	return res.status(sku_items.status).json(array);
});

//GET /api/skuitems/sku/:id
app.get('/api/skuitems/sku/:id', async (req, res) => {
	let skuitems = await wh.getSKUItemsBySKU(req.params.id);
	return res.status(skuitems.status).json(skuitems.body);
});

//GET /api/skuitems/:rfid
app.get('/api/skuitems/:rfid', async (req, res) => {
	let skuitems = await wh.getSKUItemByRFID(req.params.rfid);
	return res.status(skuitems.status).json(skuitems.body);
});

//POST /api/skuitem
app.post('/api/skuitem', async (req, res) => {
	let result = await wh.createSKUItem(req.body.RFID, req.body.SKUId.toString(), req.body.DateOfStock);
	return res.status(result.status).json(result.message);
});

//PUT /api/skuitems/:rfid
app.put('/api/skuitems/:rfid', async (req, res) => {
	let result = await wh.updateSKUItem(req.params.rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
	return res.status(result.status).json(result.message);
});

//DELETE /api/skuitems/:rfid
app.delete('/api/skuitems/:rfid', async (req, res) => {
	let result = await wh.deleteSKUItems(req.params.rfid);
	return res.status(result.status).json(result.message);
});

/*----------------------------Position------------------------------------*/

//GET /api/positions
app.get('/api/positions', async (req, res) => {
	let positions = await wh.getPositions();
	let array = [];
	positions.body.forEach((value, key) => array.push(value))
	return res.status(positions.status).json(array);
});

//POST /api/position
app.post('/api/position', async (req, res) =>{
	let result = await wh.createPosition(req.body.positionID, req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, req.body.maxVolume);
	return res.status(result.status).json(result.message);
});

//PUT /api/position/:positionID
app.put('/api/position/:positionID', async (req, res) =>{
	let result = await wh.updatePosition(req.params.positionID, req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedValue);
	return res.status(result.status).json(result.message);
});

//PUT /api/position/:positionID/changeID
app.put('/api/position/:positionID/changeID', async (req, res) =>{
	const positionID = req.body.newPositionID;
	if (positionID.length != 12) return req.status(422).json();
	let newAisleID = positionID.slice(0, 4);
	let newRow = positionID.slice(4, 8);
	let newCol = positionID.slice(8, 12);
	let result = await wh.updatePosition(req.params.positionID, newAisleID, newRow, newCol);
	return res.status(result.status).json(result.message);
});

//DELETE /api/position/:positionID
app.delete('/api/position/:positionID', async (req, res) => {
	let result = await wh.deletePosition(req.params.positionID);
	return res.status(result.status).json(result.message);
});


/** TEST DESCRIPTOR **/

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
	stripColonFromParam("id"),
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
		const result = await wh.newTestDescriptor(req.body.name, req.body.procedureDescription, req.body.idSKU);
		return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/testDescriptor/:id",
	stripColonFromParam("id"),
	param("id").isInt(),
	body("newName").exists(),
	body("newProcedureDescription").exists(),
	body("newIdSKU").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		const result = await wh.modifyTestDescriptor(req.params.id, req.body["newName"], req.body["newProcedureDescription"], req.body["newIdSKU"]);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/testDescriptor/:id",
	stripColonFromParam("id"),
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteTestDescriptor(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** TEST RESULTS **/

/* GET */
app.get("/api/skuitems/:rfid/testResults",
	stripColonFromParam("rfid"),
	param("rfid").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid rfid");
		const result = await wh.getTestResults(req.params.rfid);
		return res.status(result.status).json(result.body);
});
app.get("/api/skuitems/:rfid/testResults/:id",
	stripColonFromParam("rfid"),
	stripColonFromParam("id"),
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
		const result = await wh.newTestResult(req.body.rfid, req.body.idTestDescriptor, req.body.Date, req.body.Result);
		return res.status(result.status).send(result.body);
});

/* PUT */
app.put("/api/skuitems/:rfid/testResult/:id",
	stripColonFromParam("rfid"),
	stripColonFromParam("id"),
	param("rfid").exists(),
	param("id").isInt(),
	body("newIdTestDescriptor").isInt(),
	body("newDate").isDate(),
	body("newResult").isBoolean(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid params or body");
		const result = await wh.modifyTestResult(req.params.rfid, req.params.id, req.body["newIdTestDescriptor"], req.body["newDate"], req.body["newResult"]);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/skuitems/:rfid/testResult/:id",
	stripColonFromParam("rfid"),
	stripColonFromParam("id"),
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


/** USER **/

/* GET */
app.get("/api/userinfo",
	(req, res) => {
		const user = wh.getCurrentUser();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname, type: user.role});
});
app.get("/api/suppliers",
	(req, res) => {
		wh.getSuppliers().then((suppliers) => {
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
		const result = await wh.newUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.type);
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
		return res.status(200).end();
});

/* PUT */
app.put("/api/users/:username",
	stripColonFromParam("username"),
	param("username").isEmail(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const result = await wh.modifyUserRights(req.params.username, req.body["oldType"], req.body["newType"]);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/users/:username/:type",
	stripColonFromParam("username"),
	stripColonFromParam("type"),
	param("username").isEmail(),
	param("type").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing params");
		const result = await wh.deleteUser(req.params.username, req.params.type);
		return res.status(result.status).send(result.body);
});


// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
