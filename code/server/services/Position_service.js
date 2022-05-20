const Position = require("../components/Position");

class PositionService {
	dao;
	constructor(dao) {
		this.dao = dao;
	}

	getPositions = () => {
		return this.dao.selectPositions();
	}
	
	createPosition = async (positionID, aisleID, row, col, maxWeight, maxVolume) => {
		if (positionID.slice(0, 4) !== aisleID || positionID.slice(4, 8) !== row || positionID.slice(8, 12) !== col)
			return { status: 422, body: "ID isn't coherent with other params"};
		try {
			let newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
			await this.dao.insertPosition(newPosition);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updatePosition = async (posID, newPositionID, newAisleID = undefined, newRow = undefined, newCol = undefined, newMaxWeight = undefined, newMaxVolume = undefined, newOccupiedWeight = undefined, newOccupiedVolume = undefined) => {
		try {
			let position = await this.dao.selectPositionByID(posID);
			if (!position) return { status: 404, body: "position not found" };
			if (newAisleID !== undefined) {
				let newPosID = newAisleID+newRow+newCol;
				position.setPositionID(newPosID);
				position.setAisleID(newAisleID);
				position.setRow(newRow);
				position.setCol(newCol);
				position.setMaxWeight(newMaxWeight);
				position.setMaxVolume(newMaxVolume);
				position.setOccupiedWeight(newOccupiedWeight);
				position.setOccupiedVolume(newOccupiedVolume);
			} else {
				position.setPositionID(newPositionID);
				position.setAisleID(newPositionID.slice(0, 4));
				position.setRow(newPositionID.slice(4, 8));
				position.setCol(newPositionID.slice(8, 12));
			}
			await this.dao.updatePosition(posID, position);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}
	
	deletePosition = (posID) => {
		return this.dao.deletePosition(posID);
	}

}

module.exports = PositionService;
