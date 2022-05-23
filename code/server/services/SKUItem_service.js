const dayjs = require("dayjs");
const SKUItem = require("../components/SKUItem");

class SKUItemService {
	#skuItem_DAO; #sku_DAO;

    constructor(skuItem_DAO, sku_DAO) {
		this.#skuItem_DAO = skuItem_DAO;
        this.#sku_DAO = sku_DAO;
    }

	getSKUItems = () => {
		return this.#skuItem_DAO.selectSKUItems();
	}
	
	getSKUItemsBySKUID = (skuid) => {
		return this.#skuItem_DAO.selectSKUItemBySKUID(skuid);
	}
	
	getSKUItemByRFID = (rfid) => {
		return this.#skuItem_DAO.selectSKUItemByRFID(rfid);
	}
	
	createSKUItem = async (rfid, skuid, dateOfStock) => {
		let date;
		if (dateOfStock != null && !(date = dayjs(dateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
			return { status: 422, body: "Date isn't in correct format" };
		}
		try {
			const sku = await this.#sku_DAO.selectSKUbyID(skuid);
			if (!sku) return {status: 404, body: "sku not found"};
			await this.#skuItem_DAO.insertSKUItem(new SKUItem(rfid, skuid, 0, date));
			return {status: 201, body: ""};
		} catch(e) {
			return {status: 503, body: e};
		}
	}
	
	updateSKUItem = async (rfid, newRFID, newAvailable, newDateOfStock) => {
		let date;
		if (newDateOfStock != null && !(date = dayjs(newDateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
			return { status: 422, body: "Date isn't in correct format" };
		}
		try {
			let skuitem = await this.#skuItem_DAO.selectSKUItemByRFID(rfid)
			if (!skuitem) return { status: 404, body: "SkuItem not found" };
			skuitem.setRFID(newRFID);
			skuitem.setDateOfStock((newDateOfStock === null ? newDateOfStock : date));
			skuitem.setAvailable(newAvailable);
			await this.#skuItem_DAO.updateSKUItem(rfid, skuitem);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	deleteSKUItem = (rfid) => {
		return this.#skuItem_DAO.deleteSKUItem(rfid);
	}

	deleteSKUItems = () => {
		return this.#skuItem_DAO.deleteSKUItemData();
	}
}

module.exports = SKUItemService;