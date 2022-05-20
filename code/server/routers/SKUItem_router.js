const express = require("express");
const {body, param, validationResult} = require('express-validator');

const Warehouse = require("../components/Warehouse");

const router = express.Router();
const wh = Warehouse.getInstance();

/* GET */
router.get('/skuitems',
	(req, res) => {
		wh.getSKUItems().then((skuitems) => {
			res.status(200).json(skuitems.map((si) => ({RFID: si.RFID, SKUId: si.SKUID, Available: si.available, DateOfStock: si.dateOfStock})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get('/skuitems/sku/:id',
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
router.get('/skuitems/:rfid',
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
router.post('/skuitem',
	body("RFID").exists(),
	body("SKUId").isInt(),
	body("DateOfStock").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await wh.createSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock);
		return res.status(result.status).json(result.body);
});

/* PUT */
router.put('/skuitems/:rfid',
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
router.delete('/skuitems/:rfid',
	param("rfid").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteSKUItem(req.params.rfid).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
