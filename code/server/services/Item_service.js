const Item = require("../components/Item");

class ItemService {
	#item_DAO;
	#sku_DAO;

	constructor(item_DAO, sku_DAO) {
        this.#item_DAO = item_DAO;
		this.#sku_DAO = sku_DAO;
    }

	getItems = () => {
		return this.#item_DAO.selectItems();
	}

	getItemByID = (id) => {
		return this.#item_DAO.selectItemByID(id);
	}

	createItem = async (id, description, price, skuid, supplierId) => {
		try {
			const SKU = await this.#sku_DAO.selectSKUbyID(skuid);
			if (!SKU) return {status: 404, body: "sku not found"};
			let item = await this.#item_DAO.selectItemByID(id);
			if (item) return {status: 422, body: "supplier sells item with same id"};
			item = await this.#item_DAO.selectItemBySKUID(skuid);
			if (item) return {status: 422, body: "supplier sells item with same skuid"};
			await this.#item_DAO.insertItem(new Item(id, description, price, skuid, supplierId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	updateItem = async (id, description, price) => {
		try {
			const item = await this.#item_DAO.selectItemByID(id);
			if (!item) return {status: 404, body: "item not found"};
			item.description = description;
			item.price = price;
			await this.#item_DAO.updateItem(item);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	deleteItem = async (id) => {
		return this.#item_DAO.deleteItemByID(id);
	}

	deleteItems = async () => {
		return this.#item_DAO.deleteItemData();
	}
}

module.exports = ItemService;