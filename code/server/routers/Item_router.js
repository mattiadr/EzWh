const express = require("express");
const {body, param, validationResult} = require("express-validator");
const router = express.Router();

const ItemService = require("../services/Item_service");
const db =  require('../database/Item_DAO');

const Item_service = new ItemService(db);

/* GET */
router.get("/items",
	(req, res) => {
		Item_service.getItems().then((Items) => {
			res.status(200).json(Items.map((io) => ({ITEMID: io.getItemId(), description: io.getDescription(), price: io.getPrice(), SKUID: io.getSKUId(), supplierId: io.getSupplierId()})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/items/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		Item_service.getItemByID(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({ITEMID: io.ITEMID, description: io.description, price: io.price, SKUID: io.SKUID, supplierId: io.supplierId});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/item",
	body("id").isInt(),
	body("description").exists(),
	body("price").exists(),
	body("SKUId").isInt(),
	body("supplierId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await Item_service.createItem(req.body.id, req.body.description, req.body.price, req.body.SKUId, req.body.supplierId);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/item/:id",
	param("id").exists(),
	body("newDescription").exists(),
	body("newPrice").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing id");
		const result = await Item_service.updateItem(req.params.id, req.body.newDescription, req.body.newPrice);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/items/:id",
	param("id").exists(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		Item_service.deleteItem(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
