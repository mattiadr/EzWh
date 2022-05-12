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
