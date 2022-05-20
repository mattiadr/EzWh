const ReturnOrder = require("../components/ReturnOrder");
const ReturnOrderProduct = require("../components/ReturnOrderProduct");

const ReturnOrder_DAO = require("../database/ReturnOrder_DAO");


exports.getReturnOrders = () => {
	return ReturnOrder_DAO.selectReturnOrders();
}

exports.getReturnOrderByID = (id) => {
	return ReturnOrder_DAO.selectReturnOrderByID(id);
}

exports.newReturnOrder = async (returnDate, restockOrderId) => {
	try {
		await ReturnOrder_DAO.insertReturnOrder(new ReturnOrder(null, returnDate, restockOrderId));
		return {status: 201, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.deleteReturnOrder = (id) => {
	return ReturnOrder_DAO.deleteReturnOrder(id);
}

/** Return Order Product **/

exports.getReturnOrderProductById = (returnOrderProductId) => {
	return ReturnOrder_DAO.selectReturnOrderProductByID(returnOrderProductId);
}

exports.getReturnOrderProducts = () => {
	return ReturnOrder_DAO.selectReturnOrderProducts();
}

exports.createReturnOrderProduct = async (returnOrderId,ITEMID,price) => {
	try {
		let newReturnOrderProduct = new ReturnOrderProduct();
		newReturnOrderProduct.returnOrderId = returnOrderId;
		newReturnOrderProduct.ITEMID = ITEMID;
		newReturnOrderProduct.price = price;
		await ReturnOrder_DAO.insertReturnOrderProduct(newReturnOrderProduct);
		return { status: 201, body: {} };
	} catch (e) {
		return { status: 503, body: {}, message: e };
	}
}

exports.updateReturnOrderProduct = async (returnOrderId,ITEMID,price = undefined) => {
	try {
		let returnOrderProduct = await ReturnOrder_DAO.selectReturnOrderProductByID(returnOrderId);
		if (!returnOrderProduct) return { status: 404, body: "return order product not found" };
		if (returnOrderId !== undefined && ITEMID !== undefined) {
			returnOrderProduct.price = price;
		} else {
			returnOrderProduct.returnOrderId= returnOrderId;
			returnOrderProduct.ITEMID= ITEMID;
			returnOrderProduct.price = price;
		}
		await ReturnOrder_DAO.updateReturnOrderProduct(returnOrderId, ITEMID, returnOrderProduct);
		return { status: 200, body: "" };
	} catch (e) {
		return { status: 503, body: e };
	}
}

exports.deleteReturnOrderProduct = (returnOrderProductId) => {
	return ReturnOrder_DAO.deleteReturnOrderProduct(returnOrderProductId);
}
