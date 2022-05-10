'use strict';
const express = require('express');
const { body, validationResult } = require('express-validator');

const {Warehouse} = require("./components/Warehouse");
const {UserRole} = require("./components/User");

// init express
const app = new express();
const port = 3001;

const wh = new Warehouse();

app.use(express.json());

//GET /api/test
app.get('/api/hello', (req,res)=>{
	let message = {
		message: 'Hello World!'
	}
	return res.status(200).json(message);
});

/** USER **/
/* GET */
app.get("/api/userinfo", (req, res) => {
	if (!wh.currentUserMatchesRole()) return res.status(401).end(); // unauthorized if user is not logged in (any role)
	const user = wh.getCurrentUser();
	return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname, type: user.role});
});
app.get("/api/suppliers", (req, res) => {
	if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).end(); // unauthorized if user is not a manager
	const suppliers = wh.getSuppliers();
	return res.status(200).json(suppliers.map((s) => ({id: s.id, name: s.name, surname: s.surname, email: s.email})));
});
app.get("/api/users", (req, res) => {
	if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).end(); // unauthorized if user is not a manager
	const users = wh.getUsers();
	return res.status(200).json(users.map((u) => ({id: u.id, name: u.name, surname: u.surname, email: u.email, type: u.role})));
});

/* POST */
app.post("/api/newUser",
	body("username").isEmail(),
	body("password").isLength({min: 8}),
	(req, res) => {
		if (!wh.currentUserMatchesRole(UserRole.MANAGER)) return res.status(401).end(); // unauthorized if user is not a manager
		if (!validationResult(req).isEmpty()) return res.status(422).end(); // invalid username or password
		const result = wh.newUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.type);
		return res.status(result).end();
});
app.post("/api/managerSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).end();
		const user = wh.session(req.body.username, req.body.password, UserRole.MANAGER);
		if (!user) return res.status(401).end();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/customerSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).end();
		const user = wh.session(req.body.username, req.body.password, UserRole.CUSTOMER);
		if (!user) return res.status(401).end();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/supplierSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).end();
		const user = wh.session(req.body.username, req.body.password, UserRole.SUPPLIER);
		if (!user) return res.status(401).end();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/clerkSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).end();
		const user = wh.session(req.body.username, req.body.password, UserRole.CLERK);
		if (!user) return res.status(401).end();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/qualityEmployeeSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).end();
		const user = wh.session(req.body.username, req.body.password, UserRole.QUALITY_CHECKER);
		if (!user) return res.status(401).end();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/deliveryEmployeeSessions",
	body("username").isEmail(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).end();
		const user = wh.session(req.body.username, req.body.password, UserRole.DELIVERY);
		if (!user) return res.status(401).end();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname});
});
app.post("/api/logout", (req, res) => {
	// TODO
	return res.status(200).end();
});

/* PUT */
app.put("/api/users/:username");

/* DELETE */
app.delete("/api/users/:username/:type");


// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
