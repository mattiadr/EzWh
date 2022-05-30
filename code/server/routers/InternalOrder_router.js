const express = require("express");
const {body, param, validationResult} = require("express-validator");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

const InternalOrderService = require("../services/InternalOrder_service");

const io_db = require("../database/InternalOrder_DAO");
const {InternalOrderState} = require("../components/InternalOrder");
const InternalOrder_service = new InternalOrderService(io_db);

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
router.get("/internalOrders",
	(req, res) => {
		InternalOrder_service.getInternalOrders().then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({id: io.id, issueDate: io.issueDate, state: io.state, customerId: io.customerId, products: io.products})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrdersIssued",
	(req, res) => {
		InternalOrder_service.getInternalOrdersByState(InternalOrderState.ISSUED).then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({id: io.id, issueDate: io.issueDate, state: io.state, customerId: io.customerId, products: io.products})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/internalOrdersAccepted",
	(req, res) => {
		InternalOrder_service.getInternalOrdersByState(InternalOrderState.ACCEPTED).then((internalOrders) => {
			res.status(200).json(internalOrders.map((io) => ({id: io.id, issueDate: io.issueDate, state: io.state, customerId: io.customerId, products: io.products})));
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
				res.status(200).json({id: io.id, issueDate: io.issueDate, state: io.state, customerId: io.customerId, products: io.products});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/internalOrders",
	checkDate("issueDate"),
	body("customerId").isInt(),
	body("products").isArray(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await InternalOrder_service.newInternalOrder(req.body.issueDate, req.body.customerId, req.body.products);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/internalOrders/:id",
	param("id").isInt(),
	body("newState").isString(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		const result = await InternalOrder_service.updateInternalOrder(req.params.id, req.body.newState, req.body.products);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/internalOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		InternalOrder_service.deleteInternalOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(503).send(err);
		});
});

module.exports = router;
