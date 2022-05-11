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
