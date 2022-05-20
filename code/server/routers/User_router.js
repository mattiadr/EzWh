const express = require("express");
const {body, param, validationResult} = require("express-validator");

const User_service = require("../services/User_service");
const {UserRole} = require("../components/User");


const router = express.Router();


/* GET */
router.get("/userinfo",
	(req, res) => {
		const user = User_service.getCurrentUser();
		return res.status(200).json({id: user.id, username: user.email, name: user.name, surname: user.surname, type: user.role});
});
router.get("/suppliers",
	(req, res) => {
		User_service.getUsersByRole(UserRole.SUPPLIER).then((suppliers) => {
			res.status(200).json(suppliers.map((s) => ({id: s.id, name: s.name, surname: s.surname, email: s.email})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/users",
	(req, res) => {
		User_service.getUsers().then((users) => {
			res.status(200).json(users.map((u) => ({id: u.id, name: u.name, surname: u.surname, email: u.email, type: u.role})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/newUser",
	body("username").isEmail(),
	body("password").isLength({min: 8}),
	async (req, res) => {
		const result = await User_service.createUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.type);
		return res.status(result.status).send(result.body);
});
router.post("/managerSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await User_service.session(req.body.username, req.body.password, UserRole.MANAGER);
		return res.status(result.status).json(result.body);
});
router.post("/customerSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await User_service.session(req.body.username, req.body.password, UserRole.CUSTOMER);
		return res.status(result.status).json(result.body);
});
router.post("/supplierSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await User_service.session(req.body.username, req.body.password, UserRole.SUPPLIER);
		return res.status(result.status).json(result.body);
});
router.post("/clerkSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await User_service.session(req.body.username, req.body.password, UserRole.CLERK);
		return res.status(result.status).json(result.body);
});
router.post("/qualityEmployeeSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await User_service.session(req.body.username, req.body.password, UserRole.QUALITY_CHECKER);
		return res.status(result.status).json(result.body);
});
router.post("/deliveryEmployeeSessions",
	body("username").isEmail(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(401).send("invalid email");
		const result = await User_service.session(req.body.username, req.body.password, UserRole.DELIVERY);
		return res.status(result.status).json(result.body);
});
router.post("/logout",
	(req, res) => {
		User_service.logout();
		return res.status(200).end();
});

/* PUT */
router.put("/users/:username",
	param("username").isEmail(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const result = await User_service.updateUserRights(req.params.username, req.body.oldType, req.body.newType);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/users/:username/:type",
	param("username").isEmail(),
	param("type").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing params");
		const result = await User_service.deleteUser(req.params.username, req.params.type);
		return res.status(result.status).send(result.body);
});

module.exports = router;
