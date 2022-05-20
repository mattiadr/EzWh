const Item = require("../components/Item");

const Item_DAO = require("../database/Item_DAO");


exports.getItemByID = (itemID) => {
	return Item_DAO.selectItemByID(itemID);
}

exports.getItems = () => {
	return Item_DAO.selectItems();
}

exports.createItem = async (id, description, price, SKUID, supplierId) => {
	try {
		await Item_DAO.insertItem(new Item(id, description, price, SKUID, supplierId));
		return {status: 201, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.updateItem = async (id, description, price) => {
	try {
		let item = await Item_DAO.selectItemByID(id);
		if (!item) return { status: 404, body: "item not found" };
		item.setDescription(description);
		item.setPrice(price);
		await Item_DAO.updateItem(item);
		return { status: 200, body: "" };
	} catch (e) {
		return { status: 503, body: e };
	}
}

exports.deleteItem = (itemID) => {
	return Item_DAO.deleteItem(itemID);
}
