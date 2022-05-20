const SKU = require("../components/SKU");

class SkuService {
    sku_dao; testD_dao; pos_dao;

    constructor(sku_dao, testD_dao, pos_dao) {
        this.sku_dao = sku_dao;
		this.testD_dao = testD_dao;
		this.pos_dao = pos_dao;
    }

	getSKUs = async () => {
		try {
			let skus = await this.sku_dao.selectSKUs();
			for (let sku of skus) {
				const testIDs = await this.testD_dao.selectTestDescriptorsIDBySKUID(sku.getId());
				sku.setTestDescriptors(testIDs);
			}
			return {status: 200, body: skus};
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	getSKUbyId = async (id) => {
		try {
			let sku = await this.sku_dao.selectSKUbyID(id);
			if (!sku) return {status: 404, body: "sku not found"};
			const testIDs = await this.testD_dao.selectTestDescriptorsIDBySKUID(sku.getId());
			sku.setTestDescriptors(testIDs);
			return {status: 200, body: sku};
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	createSKU = async (description, weight, volume, notes, price, quantity) => {
		try {
			let newSKU = new SKU(null, description, weight, volume, price, notes, quantity);
			await this.sku_dao.insertSKU(newSKU);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updateSKU = async (id, positionId , newDescription = undefined, newWeight = undefined, newVolume = undefined, newNotes = undefined, newPrice = undefined, newAvailableQuantity = undefined) => {
		try {
			const sku = await this.sku_dao.selectSKUbyID(id);
			if (!sku) return {status: 404, body: "sku not found"};
			let oldPosition = undefined;
			if(sku.getPosition() != null)
				oldPosition =  await this.pos_dao.selectPositionByID(sku.getPosition());
			if (positionId !== undefined) { //ONLY POSITION
				const newPosition = await this.pos_dao.selectPositionByID(positionId);
				if(!newPosition) return {status: 404, body: "position not found"};
				if (newPosition.getOccupiedWeight() + sku.getWeight() >  newPosition.getMaxWeight() ||
					newPosition.getOccupiedVolume() + sku.getVolume() > newPosition.getMaxVolume())
						return {status: 422, body: "Can't move sku in that position"};
				sku.setPosition(positionId);
				newPosition.addOccupiedWeight(sku.getWeight());
				newPosition.addOccupiedVolume(sku.getVolume());
				await this.pos_dao.updatePosition(newPosition.getPositionID(), newPosition);
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
				await this.pos_dao.updatePosition(oldPosition.getPositionID(), oldPosition);
			}
			await this.sku_dao.updateSKU(sku);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e}
		}
	}
	
	deleteSKU = (id) => {
		return this.sku_dao.deleteSKU(id);
	}
	
}

module.exports = SkuService;