const express = require("express");
const {body, param, validationResult} = require("express-validator");
const dayjs = require("dayjs");

const RestockOrder_service = require("../services/RestockOrder_service");
const {RestockOrderState} = require("../components/RestockOrder");


const router = express.Router();

const checkDate = (field) => {
	return body(field).custom((value) => {
		if (value !== null && !dayjs(value, ["YYYY/MM/DD", "YYYY/MM/DD H:m"], true).isValid()) {
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
			res.status(500).send(err);
		});
});
router.get("/restockOrders/:id/returnItems",
	param("id").isInt(),
	async (req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid id");
		const result = await RestockOrder_service.getRestockOrderByIDReturnItems(req.params.id);
		return res.status(result.status).send(result.body);
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

// TODO everything below this
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
