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
			let oldPosition = undefined;
			if(sku.getPosition() != null)
				oldPosition =  await this.#position_DAO.selectPositionByID(sku.getPosition());
			if (positionId !== undefined) { //ONLY POSITION
				const newPosition = await this.#position_DAO.selectPositionByID(positionId);
				if(!newPosition) return {status: 404, body: "position not found"};
				if (newPosition.getOccupiedWeight() + sku.getWeight() >  newPosition.getMaxWeight() ||
					newPosition.getOccupiedVolume() + sku.getVolume() > newPosition.getMaxVolume())
						return {status: 422, body: "Can't move sku in that position"};
				sku.setPosition(positionId);
				newPosition.addOccupiedWeight(sku.getWeight());
				newPosition.addOccupiedVolume(sku.getVolume());
				await this.#position_DAO.updatePosition(newPosition.getPositionID(), newPosition);
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
				await this.#position_DAO.updatePosition(oldPosition.getPositionID(), oldPosition);
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