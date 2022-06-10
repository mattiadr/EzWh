const express = require("express");
const { body, param, validationResult } = require("express-validator");

const SkuService = require("../services/SKU_service");

const sku_db = require("../database/SKU_DAO");
const testD_db = require("../database/TestDescriptor_DAO");
const pos_db = require("../database/Position_DAO");
const SKU_service = new SkuService(sku_db, testD_db, pos_db);

const router = express.Router();

/* GET */
router.get('/skus',
	async (req, res) => {
		let result = await SKU_service.getSKUs();
		if (result.status === 200)
			return res.status(result.status).json(result.body.map((s) => ({ id: s.getId(), description: s.getDescription(), weight: s.getWeight(), volume: s.getVolume(), notes: s.getNotes(), position: s.getPosition(), availableQuantity: s.getAvailableQuantity(), price: s.getPrice(), testDescriptors: s.getTestDescriptors() })));
		return res.status(result.status).send(result.body);
	});
router.get('/skus/:id',
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		let result = await SKU_service.getSKUbyId(req.params.id);
		if (result.status === 200)
			return res.status(result.status).json({ id: result.body.getId(), description: result.body.getDescription(), weight: result.body.getWeight(), volume: result.body.getVolume(), notes: result.body.getNotes(), position: result.body.getPosition(), availableQuantity: result.body.getAvailableQuantity(), price: result.body.getPrice(), testDescriptors: result.body.getTestDescriptors() });
		return res.status(result.status).send(result.body);
	});

/* POST */
router.post('/sku',
	body("description").isString().isLength({min: 1}),
	body("weight").isInt({min: 0}),
	body("volume").isInt({min: 0}),
	body("notes").exists().isLength({min: 1}),
	body("price").isFloat({min: 0}),
	body("availableQuantity").isInt({min: 1}),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await SKU_service.createSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
		return res.status(result.status).json(result.body);
	});

/* PUT */
router.put('/sku/:id',
	param("id").isInt(),
	body("newDescription").isString().isLength({min: 1}),
	body("newWeight").isInt({min: 0}),
	body("newVolume").isInt({min: 0}),
	body("newNotes").isString().isLength({min: 1}),
	body("newPrice").isFloat({min: 0}),
	body("newAvailableQuantity").isInt({min: 1}),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await SKU_service.updateSKU(req.params.id, undefined, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity);
		return res.status(result.status).json(result.message);
	});
router.put('/sku/:id/position',
	param("id").isInt(),
	body("position").isString().isNumeric().isLength({min: 12, max: 12}),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await SKU_service.updateSKU(req.params.id, req.body.position);
		return res.status(result.status).json(result.message);
	});

/* DELETE */
router.delete('/skus/:id',
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		SKU_service.deleteSKU(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
	});

module.exports = router;
