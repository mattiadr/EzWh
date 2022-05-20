const dayjs = require("dayjs");

const SKUItem = require("../components/SKUItem");

const SKUItem_DAO = require("../database/SKUItem_DAO");
const SKU_DAO = require("../database/SKU_DAO");


exports.getSKUItems = () => {
	return SKUItem_DAO.selectSKUItems();
}

exports.getSKUItemsBySKUID = (skuid) => {
	return SKUItem_DAO.selectSKUItemBySKUID(skuid);
}

exports.getSKUItemByRFID = (rfid) => {
	return SKUItem_DAO.selectSKUItemByRFID(rfid);
}

exports.createSKUItem = async (rfid, skuid, dateOfStock) => {
	let date;
	if (dateOfStock != null && !(date = dayjs(dateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
		return { status: 422, body: "Date isn't in correct format" };
	}
	try {
		const sku = await SKU_DAO.selectSKUbyID(skuid);
		if (!sku) return {status: 404, body: "sku not found"};
		await SKUItem_DAO.insertSKUItem(new SKUItem(rfid, skuid, 0, date));
		return {status: 201, body: ""};
	} catch(e) {
		return {status: 503, body: e};
	}
}

exports.updateSKUItem = async (rfid, newRFID, newAvailable, newDateOfStock) => {
	let date;
	if (newDateOfStock != null && !(date = dayjs(newDateOfStock, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"])).isValid()) {
		return { status: 422, body: "Date isn't in correct format" };
	}
	try {
		let skuitem = await SKUItem_DAO.selectSKUItemByRFID(rfid)
		if (!skuitem) return { status: 404, body: "SkuItem not found" };
		skuitem.setRFID(newRFID);
		skuitem.setDateOfStock((newDateOfStock === null ? newDateOfStock : date));
		skuitem.setAvailable(newAvailable);
		await SKUItem_DAO.updateSKUItem(rfid, skuitem);
		return { status: 200, body: "" };
	} catch (e) {
		return { status: 503, body: {}, message: e };
	}
}

exports.deleteSKUItem = (rfid) => {
	return SKUItem_DAO.deleteSKUItem(rfid);
}
