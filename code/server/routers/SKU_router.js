const express = require("express");
const {body, param, validationResult} = require('express-validator');

const Warehouse = require("../components/Warehouse");

const router = express.Router();
const wh = Warehouse.getInstance();

/* GET */
router.get('/skus',
	async (req, res) => {
		let result = await wh.getSKUs();
		if (result.status === 200)
			return res.status(result.status).json(result.body.map((s) => ({id: s.id, description: s.description, weight: s.weight, volume: s.volume, notes: s.notes, position: s.position, availableQuantity: s.availableQuantity, price:  s.price, testDescriptors: s.testDescriptors})));
		return res.status(result.status).send(result.body);
});
router.get('/skus/:id',
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		let result = await wh.getSKUbyId(req.params.id);
		if (result.status === 200)
			return res.status(result.status).json({id: result.body.id, description: result.body.description, weight: result.body.weight, volume: result.body.volume, notes: result.body.notes, position: result.body.position, availableQuantity: result.body.availableQuantity, price:  result.body.price, testDescriptors: result.body.testDescriptors});
		return res.status(result.status).send(result.body);
});

/* POST */
router.post('/sku',
	body("description").exists(),
	body("weight").isInt(),
	body("volume").isInt(),
	body("notes").exists(),
	body("price").isFloat(),
	body("availableQuantity").isInt(),
	async (req, res) => {
		if(!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await wh.createSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
		return res.status(result.status).json(result.body);
});

/* PUT */
router.put('/sku/:id',
	param("id").isInt(),
	body("newDescription").exists(),
	body("newWeight").isInt(),
	body("newVolume").isInt(),
	body("newNotes").exists(),
	body("newPrice").isFloat(),
	body("newAvailableQuantity").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await wh.updateSKU(req.params.id, undefined, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity);
		return res.status(result.status).json(result.message);
});
router.put('/sku/:id/position',
	param("id").isInt(),
	body("position").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await wh.updateSKU(req.params.id, req.body.position);
		return res.status(result.status).json(result.message);
});

/* DELETE */
router.delete('/skus/:id',
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteSKU(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
