const express = require("express");
const {body, param, validationResult} = require('express-validator');

const Warehouse = require("../components/Warehouse");

const router = express.Router();
const wh = Warehouse.getInstance();

/* GET */
router.get("/skuitems/:rfid/testResults",
	param("rfid").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid rfid");
		const result = await wh.getTestResults(req.params.rfid);
		return res.status(result.status).json(result.body);
});
router.get("/skuitems/:rfid/testResults/:id",
	param("rfid").exists(),
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid params");
		const result = await wh.getTestResultByID(req.params.rfid, req.params.id);
		return res.status(result.status).json(result.body);
});

/* POST */
router.post("/skuitems/testResult",
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
router.put("/skuitems/:rfid/testResult/:id",
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
router.delete("/skuitems/:rfid/testResult/:id",
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

module.exports = router;
