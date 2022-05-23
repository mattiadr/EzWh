const express = require("express");
const {body, param, validationResult} = require("express-validator");

const TestResultService = require("../services/TestResult_service");

const testR_db = require("../database/TestResult_DAO");
const testD_db = require("../database/TestDescriptor_DAO");
const skuItem_db = require("../database/SKUItem_DAO");
const TestResult_service = new TestResultService(testR_db, testD_db, skuItem_db);

const router = express.Router();

/* GET */
router.get("/skuitems/:rfid/testResults",
	param("rfid").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid rfid");
		const result = await TestResult_service.getTestResults(req.params.rfid);
		return res.status(result.status).json(result.body);
});
router.get("/skuitems/:rfid/testResults/:id",
	param("rfid").exists(),
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid params");
		const result = await TestResult_service.getTestResultByID(req.params.rfid, req.params.id);
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
		const result = await TestResult_service.createTestResult(req.body.rfid, req.body.idTestDescriptor, req.body.Date, req.body.Result);
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
		const result = await TestResult_service.updateTestResult(req.params.rfid, req.params.id, req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/skuitems/:rfid/testResult/:id",
	param("rfid").exists(),
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid params");
		TestResult_service.deleteTestResult(req.params.rfid, req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(503).send(err);
		});
});

router.delete("/testResults", //TEMPORARY
	(req, res) => {
		TestResult_service.deleteTestResults().then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
	}
)

module.exports = router;
