const express = require("express");
const {body, param, validationResult} = require('express-validator');

const Warehouse = require("../components/Warehouse");

const router = express.Router();
const wh = Warehouse.getInstance();

/* GET */
router.get("/internalOrders",
	(req, res) => {
		wh.getInternalOrders().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrdersIssued",
	(req, res) => {
		wh.getInternalOrdersIssued().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrdersAccepted",
	(req, res) => {
		wh.getInternalOrdersAccepted().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getInternalOrderByID(req.params.id).then((io) => {
			if (io) {
				res.status(200).json({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/internalOrder",
	body("issueDate").exists(),
	body("customerId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await wh.newInternalOrder(req.body.issueDate, 'issued', req.body.customerId);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/internalOrders/:id",
	param("id").isInt(),
	body("newState").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		const result = await wh.updateInternalOrder(req.params.id, req.body.newState);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/internalOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.deleteInternalOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** internalOrderProducts **/

/* GET */
router.get("/internalOrderProducts",
(req, res) => {
	wh.getInternalOrderProducts().then((internalOrderProducts) => {
		res.status(200).json(internalOrderProducts.map((iop) => ({internalOrderId: iop.internalOrderId, ITEMID: iop.ITEMID, quantity: iop.quantity})));
	}).catch((err) => {
		res.status(500).send(err);
	});
});
router.get("/internalOrderProducts/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		wh.getInternalOrderProductById(req.params.id).then((iop) => {
			if (iop) {
				res.status(200).json({returnOrderId: iop.returnOrderId, ITEMID: iop.ITEMID, quantity: iop.quantity});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/internalOrderProduct",
body("quantity").isInt(),
async (req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
	const result = await wh.createInternalOrderProduct(req.body.internalOrderId, req.body.ITEMID ,req.body.quantity);
	return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/internalOrderProducts/:internalOrderId/:ITEMID",
param("internalOrderId").isInt(),
async (req, res) => {
	if (!req.is("application/json")) return res.status(422).send("malformed body");
	const result = await wh.updateInternalOrderProduct(req.params.internalOrderId, req.params.ITEMID, req.body.quantity);
	return res.status(result.status).send(result.body);
	});

/* DELETE */
router.delete("/internalOrderProduct/:internalOrderId",
param("internalOrderId").isInt(),
(req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
	wh.deleteInternalOrderProduct(req.params.internalOrderId).then(() => {
		res.status(204).end();
	}).catch((err) => {
		res.status(500).send(err);
	});
});

module.exports = router;
