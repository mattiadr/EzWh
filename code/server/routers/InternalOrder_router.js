const express = require("express");
const {body, param, validationResult} = require("express-validator");
const router = express.Router();

const db = require('../database/InternalOrder_DAO');
const InternalOrderService = require("../services/InternalOrder_service");

const InternalOrder_service = new InternalOrderService(db);

/* GET */
router.get("/internalOrders",
	(req, res) => {
		InternalOrder_service.getInternalOrders().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrdersIssued",
	(req, res) => {
		InternalOrder_service.getInternalOrdersIssued().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrdersAccepted",
	(req, res) => {
		InternalOrder_service.getInternalOrdersAccepted().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({internalOrderId: io.internalOrderId, issueDate: io.issueDate, state: io.state, customerId: io.customerId})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		InternalOrder_service.getInternalOrderByID(req.params.id).then((io) => {
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
		const result = await InternalOrder_service.newInternalOrder(req.body.issueDate, 'issued', req.body.customerId);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/internalOrders/:id",
	param("id").isInt(),
	body("newState").exists(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		const result = await InternalOrder_service.updateInternalOrder(req.params.id, req.body.newState);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/internalOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		InternalOrder_service.deleteInternalOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});


/** internalOrderProducts **/

/* GET */
router.get("/internalOrderProducts",
(req, res) => {
	InternalOrder_service.getInternalOrderProducts().then((internalOrderProducts) => {
		res.status(200).json(internalOrderProducts.map((iop) => ({internalOrderId: iop.internalOrderId, ITEMID: iop.ITEMID, quantity: iop.quantity})));
	}).catch((err) => {
		res.status(500).send(err);
	});
});
router.get("/internalOrderProducts/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		InternalOrder_service.getInternalOrderProductById(req.params.id).then((iop) => {
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
	const result = await InternalOrder_service.createInternalOrderProduct(req.body.internalOrderId, req.body.ITEMID ,req.body.quantity);
	return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/internalOrderProducts/:internalOrderId/:ITEMID",
param("internalOrderId").isInt(),
async (req, res) => {
	if (!req.is("application/json")) return res.status(422).send("malformed body");
	const result = await InternalOrder_service.updateInternalOrderProduct(req.params.internalOrderId, req.params.ITEMID, req.body.quantity);
	return res.status(result.status).send(result.body);
	});

/* DELETE */
router.delete("/internalOrderProduct/:internalOrderId",
param("internalOrderId").isInt(),
(req, res) => {
	if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
	InternalOrder_service.deleteInternalOrderProduct(req.params.internalOrderId).then(() => {
		res.status(204).end();
	}).catch((err) => {
		res.status(500).send(err);
	});
});

module.exports = router;
