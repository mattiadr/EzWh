const SKU = require("../components/SKU");

class SkuService {
    #sku_DAO; #testDescriptor_DAO; #position_DAO;

    constructor(sku_DAO, testDescriptor_DAO, position_DAO) {
        this.#sku_DAO = sku_DAO;
		this.#testDescriptor_DAO = testDescriptor_DAO;
		this.#position_DAO = position_DAO;
    }

	getSKUs = async () => {
		try {
			let skus = await this.#sku_DAO.selectSKUs();
			for (let sku of skus) {
				const testIDs = await this.#testDescriptor_DAO.selectTestDescriptorsIDBySKUID(sku.getId());
				sku.setTestDescriptors(testIDs);
			}
			return {status: 200, body: skus};
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	getSKUbyId = async (id) => {
		try {
			let sku = await this.#sku_DAO.selectSKUbyID(id);
			if (!sku) return {status: 404, body: "sku not found"};
			const testIDs = await this.#testDescriptor_DAO.selectTestDescriptorsIDBySKUID(sku.getId());
			sku.setTestDescriptors(testIDs);
			return {status: 200, body: sku};
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	createSKU = async (description, weight, volume, notes, price, quantity) => {
		try {
			let newSKU = new SKU(null, description, weight, volume, price, notes, quantity);
			await this.#sku_DAO.insertSKU(newSKU);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updateSKU = async (id, positionId , newDescription = undefined, newWeight = undefined, newVolume = undefined, newNotes = undefined, newPrice = undefined, newAvailableQuantity = undefined) => {
		try {
			const sku = await this.#sku_DAO.selectSKUbyID(id);
			if (!sku) return {status: 404, body: "sku not found"};
			let currentPosition = undefined;
			if (sku.getPosition() != null)
				currentPosition =  await this.#position_DAO.selectPositionByID(sku.getPosition());
			if (positionId !== undefined) { //ONLY POSITION
				const newPosition = await this.#position_DAO.selectPositionByID(positionId);
				if (!newPosition) return {status: 404, body: "position not found"};
				const occupied = await this.#sku_DAO.checkIfPositionOccupied(positionId);
				if (occupied) return {status: 422, body: "position already occupied"};
				if (sku.getWeight() * sku.getAvailableQuantity() > newPosition.getMaxWeight() ||
					sku.getVolume() * sku.getAvailableQuantity() > newPosition.getMaxVolume())
						return {status: 422, body: "weight or volume validation failed"};
				sku.setPosition(positionId);
				newPosition.setOccupiedWeight(sku.getWeight() * sku.getAvailableQuantity());
				newPosition.setOccupiedVolume(sku.getVolume() * sku.getAvailableQuantity());
				await this.#position_DAO.updatePosition(newPosition.getPositionID(), newPosition);
			} else {
				if (currentPosition && (
					newWeight * newAvailableQuantity > currentPosition.getMaxWeight() ||
					newVolume * newAvailableQuantity > currentPosition.getMaxVolume())) {
					return {status: 422, body: "weight or volume validation failed"};
				}
				sku.setDescription(newDescription);
				sku.setWeight(newWeight);
				sku.setVolume(newVolume);
				sku.setPrice(newPrice);
				sku.setNotes(newNotes);
				sku.setAvailableQuantity(newAvailableQuantity);
			}
			if (currentPosition !== undefined) {
				currentPosition.setOccupiedWeight(0);
				currentPosition.setOccupiedVolume(0);
				await this.#position_DAO.updatePosition(currentPosition.getPositionID(), currentPosition);
			}
			await this.#sku_DAO.updateSKU(sku);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e}
		}
	}
	
	deleteSKU = (id) => {
		return this.#sku_DAO.deleteSKU(id);
	}
}

module.exports = SkuService;