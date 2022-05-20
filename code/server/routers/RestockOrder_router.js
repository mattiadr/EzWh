const express = require("express");
const {body, param, validationResult} = require('express-validator');

const Warehouse = require("../components/Warehouse");

const router = express.Router();
const wh = Warehouse.getInstance();

/* GET */
router.get("/restockOrders",
	(req, res) => {
		wh.getRestockOrders().then((restockOrders) => {
			res.status(200).json(restockOrders.map((io) => ({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/restockOrdersIssued",
	(req, res) => {
		wh.getRestockOrdersIssued().then((restockOrders) => {
			res.status(200).json(restockOrders.map((io) => ({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems})));
		}).catch((err) => {
			res.status(500).send(err);
		});
	});
router.get("/restockOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getRestockOrderByID(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

router.get("/restockOrders/:id/returnItems",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getProducts(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({skuItems: io.skuItems});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
	});

/* POST */
router.post("/restockOrder",
	body("issueDate").exists(),
	body("supplierId").isInt(),
	body("products").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.createRestockOrder(req.body.issueDate, req.body.products.SKUId, req.body.products.description,req.body.products.price,req.body.products.qty,req.body.supplierId);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/restockOrders/:id",
	param("id").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const ro = wh.getRestockOrderByID(req.params.id);
		const result = await wh.updateRestockOrder(req.params.id, ro.issueDate, ro.state, ro.supplierId, ro.transportNote, ro.skuItems);
		return res.status(result.status).send(result.body);
});

router.put("/restockOrder/:id/skuItems",
	param("id").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const ro = wh.getRestockOrderByID(req.params.id);
		const result = await wh.addProducts(ro, req.body.skuItems);
		return res.status(result.status).send(result.body);
	});

/* DELETE */
router.delete("/restockOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteRestockOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
