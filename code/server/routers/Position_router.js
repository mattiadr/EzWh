const express = require("express");
const {body, param, validationResult} = require("express-validator");
const router = express.Router();

const PositionService = require("../services/Position_service");
const Position = require("../components/Position");
const db = require('../database/Position_DAO');

const Position_service = new PositionService(db);



/* GET */
router.get('/positions',
	(req, res) => {
		Position_service.getPositions().then((positions) => {
			res.status(200).json(positions.map((p) => ({positionID: p.getPositionID(), aisleID: p.getAisleID(), row: p.getRow(), col: p.getCol(), maxWeight: p.getMaxWeight(), maxVolume: p.getMaxVolume(), occupiedWeight: p.getOccupiedWeight(), occupiedVolume: p.getOccupiedVolume()})));
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
		let result = await Position_service.createPosition(req.body.positionID, req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, req.body.maxVolume);
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
		let result = await Position_service.updatePosition(req.params.positionID, undefined, req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume);
		return res.status(result.status).json(result.message);
});
router.put('/position/:positionID/changeID',
	param("positionID").exists(),
	body("newPositionID").exists(),
	async (req, res) =>{
		if (!validationResult(req).isEmpty() || req.body.newPositionID.length !== 12) return res.status(422).send("invalid param or body");
		let result = await Position_service.updatePosition(req.params.positionID, req.body.newPositionID);
		return res.status(result.status).json(result.message);
});

/* DELETE */
router.delete('/position/:positionID',
	param("positionID").exists(),
	(req, res) => {
		if (!validationResult(req).isEmpty()) return res.status(422).send("invalid positionID");
		Position_service.deletePosition(req.params.positionID).then(() => {
			res.status(204).end();
		}).catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
