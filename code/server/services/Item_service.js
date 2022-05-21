const Item = require("../components/Item");

const Item_DAO = require("../database/Item_DAO");
const SKU_DAO = require("../database/SKU_DAO");


exports.getItems = () => {
	return Item_DAO.selectItems();
}

exports.getItemByID = (id) => {
	return Item_DAO.selectItemByID(id);
}

exports.createItem = async (id, description, price, skuid, supplierId) => {
	try {
		const SKU = await SKU_DAO.selectSKUbyID(skuid);
		if (!SKU) return {status: 404, body: "sku not found"};
		let item = await Item_DAO.selectItemByID(id);
		if (item) return {status: 422, body: "supplier sells item with same id"};
		item = await Item_DAO.selectItemBySKUID(skuid);
		if (item) return {status: 422, body: "supplier sells item with same skuid"};
		await Item_DAO.insertItem(new Item(id, description, price, skuid, supplierId));
		return {status: 201, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.updateItem = async (id, description, price) => {
	try {
		const item = await Item_DAO.selectItemByID(id);
		if (!item) return {status: 404, body: "item not found"};
		item.description = description;
		item.price = price;
		await Item_DAO.updateItem(item);
		return {status: 200, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.deleteItem = async (id) => {
	return Item_DAO.deleteItemByID(id);
}
