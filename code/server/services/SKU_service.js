const SKU = require("../components/SKU");

const SKU_DAO = require("../database/SKU_DAO");
const TestDescriptor_DAO = require("../database/TestDescriptor_DAO");
const Position_DAO = require("../database/Position_DAO");

exports.getSKUs = async () => {
	try {
		let skus = await SKU_DAO.selectSKUs();
		for (let sku of skus) {
			const testIDs = await TestDescriptor_DAO.selectTestDescriptorsIDBySKUID(sku.getId());
			sku.setTestDescriptors(testIDs);
		}
		return {status: 200, body: skus};
	} catch (e) {
		return {status: 500, body: e};
	}
}

exports.getSKUbyId = async (id) => {
	try {
		let sku = await SKU_DAO.selectSKUbyID(id);
		if (!sku) return {status: 404, body: "sku not found"};
		const testIDs = await TestDescriptor_DAO.selectTestDescriptorsIDBySKUID(sku.getId());
		sku.setTestDescriptors(testIDs);
		return {status: 200, body: sku};
	} catch (e) {
		return {status: 500, body: e};
	}
}

exports.createSKU = async (description, weight, volume, notes, price, quantity) => {
	try {
		let newSKU = new SKU(null, description, weight, volume, price, notes, quantity);
		await SKU_DAO.insertSKU(newSKU);
		return { status: 201, body: {} };
	} catch (e) {
		return { status: 503, body: {}, message: e };
	}
}

exports.updateSKU = async (id, positionId , newDescription = undefined, newWeight = undefined, newVolume = undefined, newNotes = undefined, newPrice = undefined, newAvailableQuantity = undefined) => {
	try {
		const sku = await SKU_DAO.selectSKUbyID(id);
		if (!sku) return {status: 404, body: "sku not found"};
		let oldPosition = undefined;
		if(sku.getPosition() != null)
			oldPosition =  await Position_DAO.selectPositionByID(sku.getPosition());
		if (positionId !== undefined) { //ONLY POSITION
			const newPosition = await Position_DAO.selectPositionByID(positionId);
			if(!newPosition) return {status: 404, body: "position not found"};
			if (newPosition.getOccupiedWeight() + sku.getWeight() >  newPosition.getMaxWeight() ||
				newPosition.getOccupiedVolume() + sku.getVolume() > newPosition.getMaxVolume())
					return {status: 422, body: "Can't move sku in that position"};
			sku.setPosition(positionId);
			newPosition.addOccupiedWeight(sku.getWeight());
			newPosition.addOccupiedVolume(sku.getVolume());
			await Position_DAO.updatePosition(newPosition.getPositionID(), newPosition);
		} else {
			sku.setDescription(newDescription);
			sku.setWeight(newWeight);
			sku.setVolume(newVolume);
			sku.setPrice(newPrice);
			sku.setNotes(newNotes);
			sku.setAvailableQuantity(newAvailableQuantity);
		}
		if (oldPosition !== undefined) {
			oldPosition.subOccupiedWeight(sku.getWeight());
			oldPosition.subOccupiedVolume(sku.getVolume());
			await Position_DAO.updatePosition(oldPosition.getPositionID(), oldPosition);
		}
		await SKU_DAO.updateSKU(sku);
		return {status: 200, body: ""};
	} catch (e) {
		return {status: 503, body: e}
	}
}

exports.deleteSKU = (id) => {
	return SKU_DAO.deleteSKU(id);
}
