const Item = require("../components/Item");

class ItemService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

	getItemByID = (itemID) => {
		return this.dao.selectItemByID(itemID);
	}
	
	getItems = () => {
		return this.dao.selectItems();
	}
	
	createItem = async (id, description, price, SKUID, supplierId) => {
		try {
			await this.dao.insertItem(new Item(id, description, price, SKUID, supplierId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	updateItem = async (id, description, price) => {
		try {
			let item = await this.dao.selectItemByID(id);
			if (!item) return { status: 404, body: "item not found" };
			item.setDescription(description);
			item.setPrice(price);
			await this.dao.updateItem(item);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}
	
	deleteItem = (itemID) => {
		return this.dao.deleteItem(itemID);
	}
	
}

module.exports = ItemService;