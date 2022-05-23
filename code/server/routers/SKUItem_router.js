const express = require("express");
const {body, param, validationResult} = require("express-validator");

const SKUItemService = require("../services/SKUItem_service");

const skuItem_db = require("../database/SKUItem_DAO");
const sku_db = require("../database/SKU_DAO");
const SKUItem_service = new SKUItemService(skuItem_db, sku_db);

const router = express.Router();

/* GET */
router.get('/skuitems',
	(req, res) => {
		SKUItem_service.getSKUItems().then((skuitems) => {
			res.status(200).json(skuitems.map((si) => ({RFID: si.getRFID(), SKUId: si.getSKUId(), Available: si.getAvailable(), DateOfStock: si.getDateOfStock()})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get('/skuitems/sku/:id',
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid skuID");
		SKUItem_service.getSKUItemsBySKUID(req.params.id).then((si) => {
			if (si) res.status(200).json({RFID: si.getRFID(), SKUId: si.getSKUId(), DateOfStock: si.getDateOfStock()});
			else res.status(404).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get('/skuitems/:rfid',
	param("rfid").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid rfid");
		SKUItem_service.getSKUItemByRFID(req.params.rfid).then((si) => {
			if (si) res.status(200).json({RFID: si.getRFID(), SKUId: si.getSKUId(), Available: si.getAvailable(), DateOfStock: si.getDateOfStock()});
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
		let result = await SKUItem_service.createSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock);
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
		let result = await SKUItem_service.updateSKUItem(req.params.rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
		return res.status(result.status).json(result.message);
});

/* DELETE */
router.delete('/skuitems/:rfid',
	param("rfid").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		SKUItem_service.deleteSKUItem(req.params.rfid).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

router.delete('/skuitems',
	async (req, res) => {
		SKUItem_service.deleteSKUItems().then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
