const Position = require("../components/Position");

class PositionService {
	#position_DAO;

	constructor(position_DAO) {
		this.#position_DAO = position_DAO;
	}

	getPositions = () => {
		return this.#position_DAO.selectPositions();
	}
	
	createPosition = async (positionID, aisleID, row, col, maxWeight, maxVolume) => {
		if (positionID.slice(0, 4) !== aisleID || positionID.slice(4, 8) !== row || positionID.slice(8, 12) !== col)
			return { status: 422, body: "ID isn't coherent with other params"};
		try {
			let newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
			await this.#position_DAO.insertPosition(newPosition);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updatePosition = async (posID, newPositionID, newAisleID = undefined, newRow = undefined, newCol = undefined, newMaxWeight = undefined, newMaxVolume = undefined, newOccupiedWeight = undefined, newOccupiedVolume = undefined) => {
		try {
			let position = await this.#position_DAO.selectPositionByID(posID);
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
			await this.#position_DAO.updatePosition(posID, position);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}
	
	deletePosition = (posID) => {
		return this.#position_DAO.deletePosition(posID);
	}

}

module.exports = PositionService;
