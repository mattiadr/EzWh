'use strict';
const express = require('express');
const { body, param, validationResult} = require('express-validator');

const {Warehouse} = require("./components/Warehouse");
const {UserRole} = require("./components/User");

// init express
const app = new express();
const port = 3001;

const wh = new Warehouse();

app.use(express.json());


/** USER **/

/* GET */
app.get("/api/userinfo",
	(req, res) => {
		if (!wh.currentUserMatchesRole()) return res.status(401).send("unauthorized");
		const user = wh.getCurrentUser();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname, type: user.role});
});
app.get("/api/suppliers",
	(req, res) => {
		if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).send("unauthorized");
		const suppliers = wh.getSuppliers();
		return res.status(200).json(suppliers.map((s) => ({id: s.id, name: s.name, surname: s.surname, email: s.email})));
});
app.get("/api/users",
	(req, res) => {
		if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).send("unauthorized");
		const users = wh.getUsers();
		return res.status(200).json(users.map((u) => ({id: u.id, name: u.name, surname: u.surname, email: u.email, type: u.role})));
});

/* POST */
app.post("/api/newUser",
	body("username").isEmail(),
	body("password").isLength({min: 8}),
	(req, res) => {
		if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).send("unauthorized");
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid username or password");
		const result = wh.newUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.type);
		return res.status(result.status).send(result.body);
});
app.post("/api/managerSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const user = wh.session(req.body.username, req.body.password, UserRole.MANAGER);
		if (!user) return res.status(401).send("wrong username password or role");
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/customerSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const user = wh.session(req.body.username, req.body.password, UserRole.CUSTOMER);
		if (!user) return res.status(401).send("wrong username password or role");
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/supplierSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const user = wh.session(req.body.username, req.body.password, UserRole.SUPPLIER);
		if (!user) return res.status(401).send("wrong username password or role");
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/clerkSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const user = wh.session(req.body.username, req.body.password, UserRole.CLERK);
		if (!user) return res.status(401).send("wrong username password or role");
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/qualityEmployeeSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const user = wh.session(req.body.username, req.body.password, UserRole.QUALITY_CHECKER);
		if (!user) return res.status(401).send("wrong username password or role");
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/deliveryEmployeeSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const user = wh.session(req.body.username, req.body.password, UserRole.DELIVERY);
		if (!user) return res.status(401).send("wrong username password or role");
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/logout",
	(req, res) => {
		if (!wh.currentUserMatchesRole()) return res.status(401).send("unauthorized");
		// TODO
		return res.status(200).end();
});

/* PUT */
app.put("/api/users/:username",
	param("username").exists(),
	(req, res) => {
		if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).send("unauthorized");
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const result = wh.modifyUserRights(req.params.username.substring(1), req.body.oldType, req.body.newType);
		return res.status(result.status).send(result.body);
});

/* DELETE */
app.delete("/api/users/:username/:type",
	param("username").exists(),
	param("type").exists(),
	(req, res) => {
		if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).send("unauthorized");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing params");
		const result = wh.deleteUser(req.params.username.substring(1), req.params.type.substring(1));
		console.log(wh.db_help.getUsers())
		return res.status(result.status).send(result.body);
});


// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
