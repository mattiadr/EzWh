const express = require("express");
const {body, param, validationResult} = require('express-validator');

const Warehouse = require("../components/Warehouse");

const router = express.Router();
const wh = Warehouse.getInstance();

/* GET */
router.get('/positions',
	(req, res) => {
		wh.getPositions().then((positions) => {
			res.status(200).json(positions.map((p) => ({positionID: p.positionID, aisleID: p.aisleID, row: p.row, col: p.idSKU, maxWeight: p.maxWeight, maxVolume: p.maxVolume, occupiedWeight: p.occupiedWeight, occupiedVolume: p.occupiedVolume})));
		}).catch((err) => {
			res.status(500).send(err);
		});
});

/* POST */
router.post('/position',
	body("positionID").exists(),
	body("aisleID").exists(),
	body("row").exists(),
	body("col").exists(),
	body("maxWeight").isInt(),
	body("maxVolume").isInt(),
	async (req, res) =>{
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid body");
		let result = await wh.createPosition(req.body.positionID, req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, req.body.maxVolume);
		return res.status(result.status).json(result.message);
});

/* PUT */
router.put('/position/:positionID',
	param("positionID").exists(),
	body("newAisleID").exists(),
	body("newRow").exists(),
	body("newCol").exists(),
	body("newMaxWeight").isInt(),
	body("newMaxVolume").isInt(),
	body("newOccupiedWeight").isInt(),
	body("newOccupiedVolume").isInt(),
	async (req, res) =>{
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid param or body");
		let result = await wh.updatePosition(req.params.positionID, undefined, req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume);
		return res.status(result.status).json(result.message);
});
router.put('/position/:positionID/changeID',
	param("positionID").exists(),
	body("newPositionID").exists(),
	async (req, res) =>{
		if (!validationResult(req).isEmpty() || req.body.newPositionID.length !== 12) return res.status(422).send("invalid param or body");
		let result = await wh.updatePosition(req.params.positionID, req.body.newPositionID);
		return res.status(result.status).json(result.message);
});

/* DELETE */
router.delete('/position/:positionID',
	param("positionID").exists(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid positionID");
		wh.deletePosition(req.params.positionID).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
