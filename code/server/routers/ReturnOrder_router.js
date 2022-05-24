const express = require("express");
const {body, param, validationResult} = require("express-validator");
const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');

const ReturnOrderService = require("../services/ReturnOrder_service");

const reo_db = require("../database/ReturnOrder_DAO");
const ro_db = require("../database/RestockOrder_DAO")
const ReturnOrder_service = new ReturnOrderService(reo_db, ro_db);

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
router.get("/returnOrders",
	(req, res) => {
		ReturnOrder_service.getReturnOrders().then((returnOrders) => {
			res.status(200).json(returnOrders.map((reo) => ({id: reo.id, returnDate: reo.returnDate, restockOrderId: reo.restockOrderId, products: reo.products})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/returnOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		ReturnOrder_service.getReturnOrderByID(req.params.id).then((reo) => {
			if (reo) {
				res.status(200).json({id: reo.id, returnDate: reo.returnDate, restockOrderId: reo.restockOrderId, products: reo.products});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post("/returnOrder",
	checkDate("returnDate"),
	body("products").isArray(),
	body("restockOrderId").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await ReturnOrder_service.newReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderId);
		return res.status(result.status).send(result.body);
});

/* DELETE */
router.delete("/returnOrder/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		ReturnOrder_service.deleteReturnOrder(req.params.id).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
