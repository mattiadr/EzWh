const express = require("express");
const {body, param, validationResult} = require("express-validator");

const ItemService = require("../services/Item_service");

const item_db = require("../database/Item_DAO");
const sku_db = require("../database/SKU_DAO");
const Item_service = new ItemService(item_db, sku_db);

const router = express.Router();

/* GET */
router.get("/items",
	(req, res) => {
		Item_service.getItems().then((items) => {
			res.status(200).json(items.map((item) => ({id: item.id, description: item.description, price: item.price, SKUId: item.SKUID, supplierId: item.supplierId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/items/:id/:supplierId",
	param("id").isInt(),
	param("supplierId").isInt(),
	(req, res) => {
		console.log("requesting item", req.params)
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		Item_service.getItemByID(req.params.id, req.params.supplierId).then((item) => {
			if (item) {
				res.status(200).json({id: item.id, description: item.description, price: item.price, SKUId: item.SKUID, supplierId: item.supplierId});
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
	body("price").isFloat({"min": 0}),
	body("SKUId").isInt(),
	body("supplierId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await Item_service.createItem(req.body.id, req.body.description, req.body.price, req.body.SKUId, req.body.supplierId);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/item/:id/:supplierId",
	param("id").isInt(),
	param("supplierId").isInt(),
	body("newDescription").exists(),
	body("newPrice").isFloat(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(422).send("missing id");
		const result = await Item_service.updateItem(req.params.id, req.body.newDescription, req.body.newPrice, req.params.supplierId);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/items/:id/:supplierId",
	param("id").isInt(),
	param("supplierId").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		Item_service.deleteItem(req.params.id, req.params.supplierId).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
