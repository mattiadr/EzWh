const express = require("express");
const {body, param, validationResult} = require("express-validator");
const dayjs = require("dayjs");

const RestockOrderService = require("../services/RestockOrder_service");
const {RestockOrderState} = require("../components/RestockOrder");

const ro_db = require("../database/RestockOrder_DAO");
const RestockOrder_service = new RestockOrderService(ro_db);

const router = express.Router();

const checkDate = (field) => {
	return body(field).custom((value) => {
		if (value !== null && !dayjs(value, ["YYYY/MM/DD", "YYYY/MM/DD HH:mm"], true).isValid()) {
			throw new Error("Invalid date");
		}
		return true;
	});
}

/* GET */
router.get("/restockOrders",
	(req, res) => {
		RestockOrder_service.getRestockOrders().then((restockOrders) => {
			res.status(200).json(restockOrders.map((ro) => ({
				id: ro.id,
				issueDate: ro.issueDate,
				state: ro.state,
				supplierId: ro.supplierId,
				transportNote: ro.transportNote,
				products: ro.products,
				skuItems: ro.skuItems,
			})));
		}).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});
router.get("/restockOrdersIssued",
	(req, res) => {
		RestockOrder_service.getRestockOrdersByState(RestockOrderState.ISSUED).then((restockOrders) => {
			res.status(200).json(restockOrders.map((ro) => ({
				id: ro.id,
				issueDate: ro.issueDate,
				state: ro.state,
				supplierId: ro.supplierId,
				transportNote: ro.transportNote,
				products: ro.products,
				skuItems: ro.skuItems,
			})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});
router.get("/restockOrders/:id",
	param("id").isInt(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		RestockOrder_service.getRestockOrderByID(req.params.id).then((ro) => {
			if (ro) {
				res.status(200).json({
					id: ro.id,
					issueDate: ro.issueDate,
					state: ro.state,
					supplierId: ro.supplierId,
					transportNote: ro.transportNote,
					products: ro.products,
					skuItems: ro.skuItems,
				});
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			console.log(err)
			res.status(500).send(err);
		});
});
router.get("/restockOrders/:id/returnItems",
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		const result = await RestockOrder_service.getRestockOrderByIDReturnItems(req.params.id);
		return res.status(result.status).json(result.body);
});

/* POST */
router.post("/restockOrder",
	checkDate("issueDate"),
	body("supplierId").isInt(),
	body("products").isArray(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		const result = await RestockOrder_service.createRestockOrder(req.body.issueDate, req.body.supplierId, req.body.products);
		return res.status(result.status).send(result.body);
});

/* PUT */
router.put("/restockOrder/:id",
	param("id").isInt(),
	body("newState").isString(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id or body");
		const result = await RestockOrder_service.updateRestockOrderState(req.params.id, req.body.newState);
		return res.status(result.status).send(result.body);
});
router.put("/restockOrder/:id/skuItems",
	param("id").isInt(),
	body("skuItems").isArray(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id or body");
		const result = await RestockOrder_service.addSkuItemsToRestockOrder(req.params.id, req.body.skuItems);
		return res.status(result.status).send(result.body);
});
router.put("/restockOrder/:id/transportNote",
	param("id").isInt(),
	body("transportNote").isObject(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id or body");
		const deliveryDate = req.body.transportNote.deliveryDate;
		if (deliveryDate !== null && !dayjs(deliveryDate, ["YYYY/MM/DD", "YYYY/MM/DD HH:mm"], true).isValid()) return res.status(422).send("invalid date");
		const result = await RestockOrder_service.updateRestockOrderTransportNote(req.params.id, deliveryDate);
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
