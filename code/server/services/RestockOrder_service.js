const RestockOrder = require("../components/RestockOrder");
const RestockOrderItem = require("../components/RestockOrderItem");

const RestockOrder_DAO = require("../database/RestockOrder_DAO");


exports.getRestockOrderByID = (restockOrderID) => {
	return RestockOrder_DAO.selectRestockOrderByID(restockOrderID);
}

exports.getRestockOrders = () => {
	return RestockOrder_DAO.selectRestockOrders();
}

exports.getRestockOrdersIssued = () => {
	return RestockOrder_DAO.selectRestockOrdersIssued();
}

exports.createRestockOrder = async (issueDate,SKUId,description,price,quantity,supplierId) => {
	try {
		let ROID = 10*Math.random();
		await RestockOrder_DAO.insertRestockOrder(new RestockOrder(ROID,issueDate,'issued',supplierId,null),
		new RestockOrderItem(ROID,SKUId,description,price,quantity));
		return { status: 201, body: {} };
	} catch (e) {
		console.log("exception", e);
		return {status: 503, body: e};
	}
}

exports.deleteRestockOrder = (restockOrderID) => {
	return RestockOrder_DAO.deleteRestockOrder(restockOrderID);
}
