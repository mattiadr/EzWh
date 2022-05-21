const {RestockOrder, RestockOrderState} = require("../components/RestockOrder");

const RestockOrder_DAO = require("../database/RestockOrder_DAO");


exports.getRestockOrders = () => {
	return RestockOrder_DAO.selectRestockOrders();
}

exports.getRestockOrdersByState = (state) => {
	return RestockOrder_DAO.selectRestockOrdersByState(state);
}

exports.getRestockOrderByID = (id) => {
	return RestockOrder_DAO.selectRestockOrderByID(id);
}

exports.getRestockOrderByIDReturnItems = async (id) => {
	try {
		const restockOrder = RestockOrder_DAO.selectRestockOrderByID(id);
		if (!restockOrder) return {status: 404, body: "restock order not found"};
		if (restockOrder.state !== RestockOrderState.COMPLETEDRETURN) return {status: 422, body: "restock order is in invalid state"};
		// TODO filter skuitems
	} catch (e) {
		return {status: 500, body: e};
	}
}

exports.createRestockOrder = async (issueDate, supplierId, products) => {
	try {
		const restockOrder = new RestockOrder(null, issueDate, RestockOrderState.ISSUED, supplierId, products);
		await RestockOrder_DAO.insertRestockOrder(restockOrder);
		return {status: 201, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

// TODO everything below this
exports.deleteRestockOrder = (restockOrderID) => {
	return RestockOrder_DAO.deleteRestockOrder(restockOrderID);
}
