const express = require("express");
const {body, param, validationResult} = require("express-validator");
const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat')

const SKUItemService = require("../services/SKUItem_service");

const skuItem_db = require("../database/SKUItem_DAO");
const sku_db = require("../database/SKU_DAO");
const SKUItem_service = new SKUItemService(skuItem_db, sku_db);

const router = express.Router();
dayjs.extend(customParseFormat);

const checkDate = (field) => {
	return body(field).custom((value) => {
		if (value !== null && !dayjs(value, ["YYYY/MM/DD", "YYYY/MM/DD HH:mm"], true).isValid()) {
			throw new Error("Invalid date");
		}
		return true;
	});
}

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
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid skuID");
		const result = await SKUItem_service.getSKUItemsBySKUID(req.params.id);
		return res.status(result.status).json(result.body);
});
router.get('/skuitems/:rfid',
	param("rfid").isNumeric().isLength({min: 32, max: 32}),
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
	body("RFID").isNumeric().isLength({min: 32, max: 32}),
	body("SKUId").isInt(),
	checkDate("DateOfStock"),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await SKUItem_service.createSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock);
		return res.status(result.status).json(result.body);
});

/* PUT */
router.put('/skuitems/:rfid',
	param("rfid").isNumeric().isLength({min: 32, max: 32}),
	body("newRFID").exists(),
	body("newAvailable").isInt(),
	checkDate("newDateOfStock"),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await SKUItem_service.updateSKUItem(req.params.rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
		return res.status(result.status).json(result.message);
});

/* DELETE */
router.delete('/skuitems/:rfid',
	param("rfid").isNumeric().isLength({min: 32, max: 32}),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		SKUItem_service.deleteSKUItem(req.params.rfid).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
