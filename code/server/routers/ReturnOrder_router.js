const express = require("express");
const {body, param, validationResult} = require('express-validator');

const Warehouse = require("../components/Warehouse");

const router = express.Router();
const wh = Warehouse.getInstance();


/* GET */
router.get("/returnOrders",
	(req, res) => {
		wh.getReturnOrders().then((returnOrders) => {
			res.status(200).json(returnOrders.map((ro) => ({returnOrderId: ro.returnOrderId, returnDate: ro.returnDate, restockOrderId: ro.restockOrderId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/returnOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getReturnOrderByID(req.params.id).then((ro) => {
			if (ro) {
				res.status(200).json({returnOrderId: ro.returnOrderId, returnDate: ro.returnDate, restockOrderId: ro.restockOrderId});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/returnOrder",
	body("returnDate").exists(),
	body("products").isArray(),
	body("restockOrderId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.newReturnOrder(req.body.returnDate, req.body.restockOrderId);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/returnOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteReturnOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** returnOrderProducts **/

/* GET */
router.get("/returnOrderProducts",
(req, res) => {
	wh.getReturnOrderProducts().then((returnOrderProducts) => {
		res.status(200).json(returnOrderProducts.map((rop) => ({returnOrderId: rop.returnOrderId, ITEMID: rop.ITEMID, price: rop.price})));
	}).catch((err) => {
		res.status(500).send(err);
	});
});
router.get("/returnOrderProducts/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getReturnOrderProductById(req.params.id).then((rop) => {
			if (rop) {
				res.status(200).json({returnOrderId: rop.returnOrderId, ITEMID: rop.ITEMID, price: rop.price});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/returnOrderProduct",
body("price").exists(),
async (req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
	const result = await wh.createReturnOrderProduct(req.body.price);
	return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/returnOrderProducts/:id",
param("id").isInt(),
async (req, res) => {
	if (!req.is("application/json")) return res.status(422).send("malformed body");
	if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
	const result = await wh.updateReturnOrderProduct(req.params.returnOrderId, req.params.ITEMID, req.body.price);
	return res.status(result.status).send(result.body);
	});

/* DELETE */
router.delete("/returnOrderProduct/:id",
param("id").isInt(),
(req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
	wh.deleteReturnOrderProduct(req.params.returnOrderId).then(() => {
		res.status(204).end();
	}).catch((err) => {
		res.status(500).send(err);
	});
});

module.exports = router;
