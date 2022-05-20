const express = require("express");
const {body, param, validationResult} = require("express-validator");

const RestockOrder_service = require("../services/RestockOrder_service");


const router = express.Router();

/* GET */
router.get("/restockOrders",
	(req, res) => {
		RestockOrder_service.getRestockOrders().then((restockOrders) => {
			res.status(200).json(restockOrders.map((io) => ({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/restockOrdersIssued",
	(req, res) => {
		RestockOrder_service.getRestockOrdersIssued().then((restockOrders) => {
			res.status(200).json(restockOrders.map((io) => ({ROID: io.ROID, issueDate: io.issueDate, state: io.state, supplierId: io.supplierId, transportNote: io.transportNote, skuItems: io.skuItems})));
		}).catch((err) => {
			res.status(500).send(err);
		});
	});
router.get("/restockOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		RestockOrder_service.getRestockOrderByID(req.params.id).then((io) => {
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
		RestockOrder_service.getProducts(req.params.id).then((io) => {
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
		const result = await RestockOrder_service.createRestockOrder(req.body.issueDate, req.body.products.SKUId, req.body.products.description,req.body.products.price,req.body.products.qty,req.body.supplierId);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/restockOrders/:id",
	param("id").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const ro = RestockOrder_service.getRestockOrderByID(req.params.id);
		const result = await RestockOrder_service.updateRestockOrder(req.params.id, ro.issueDate, ro.state, ro.supplierId, ro.transportNote, ro.skuItems);
		return res.status(result.status).send(result.body);
});

router.put("/restockOrder/:id/skuItems",
	param("id").exists(),
	async (req, res) => {
		if (!req.is("application/json")) return res.status(422).send("malformed body");
		if (!validationResult(req).isEmpty()) return res.status(404).send("missing username");
		const ro = RestockOrder_service.getRestockOrderByID(req.params.id);
		const result = await RestockOrder_service.addProducts(ro, req.body.skuItems);
		return res.status(result.status).send(result.body);
	});

/* DELETE */
router.delete("/restockOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		RestockOrder_service.deleteRestockOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
