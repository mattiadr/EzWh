const express = require("express");
const {body, param, validationResult} = require("express-validator");
const router = express.Router();

const TestDescriptorService = require("../services/TestDescriptor_service");
const testD_db =  require('../database/TestDescriptor_DAO');
const sku_db =  require('../database/SKU_DAO');

const TestDescriptor_service = new TestDescriptorService(testD_db, sku_db)




/* GET */
router.get("/testDescriptors",
	(req, res) => {
		TestDescriptor_service.getTestDescriptors().then((testDescriptors) => {
			res.status(200).json(testDescriptors.map((td) => ({id: td.id, name: td.name, procedureDescription: td.procedureDescription, idSKU: td.idSKU})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/testDescriptors/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		TestDescriptor_service.getTestDescriptorByID(req.params.id).then((td) => {
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
router.post("/testDescriptor",
	body("name").exists(),
	body("procedureDescription").exists(),
	body("idSKU").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await TestDescriptor_service.createTestDescriptor(req.body.name, req.body.procedureDescription, req.body.idSKU);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/testDescriptor/:id",
	param("id").isInt(),
	body("newName").exists(),
	body("newProcedureDescription").exists(),
	body("newIdSKU").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		const result = await TestDescriptor_service.updateTestDescriptor(req.params.id, req.body.newName, req.body.newProcedureDescription, req.body.newIdSKU);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/testDescriptor/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		TestDescriptor_service.deleteTestDescriptor(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
