const dayjs = require("dayjs");

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
		const restockOrder = await RestockOrder_DAO.selectRestockOrderByID(id);
		if (!restockOrder) return {status: 404, body: "restock order not found"};
		if (restockOrder.state !== RestockOrderState.COMPLETEDRETURN) return {status: 422, body: "restock order is in invalid state"};
		const returnItems = await RestockOrder_DAO.selectRestockOrderByIDReturnItems(id);
		return {status: 200, body: returnItems};
	} catch (e) {
		return {status: 500, body: e};
	}
}

exports.createRestockOrder = async (issueDate, supplierId, products) => {
	try {
		const restockOrder = new RestockOrder(null, issueDate, RestockOrderState.ISSUED, supplierId, null, products);
		await RestockOrder_DAO.insertRestockOrder(restockOrder);
		return {status: 201, body: ""};
	} catch (e) {
		console.log(e)
		return {status: 503, body: e};
	}
}

exports.updateRestockOrderState = async (id, newState) => {
	try {
		if (!Object.values(RestockOrderState).includes(newState)) return {status: 422, body: "invalid state"};
		const restockOrder = await RestockOrder_DAO.selectRestockOrderByID(id);
		if (!restockOrder) return {status: 404, body: "restock order not found"};
		restockOrder.state = newState;
		await RestockOrder_DAO.updateRestockOrder(restockOrder);
		return {status: 200, body: ""};
	} catch (e) {
		console.log(e)
		return {status: 503, body: e};
	}
}

exports.addSkuItemsToRestockOrder = async (id, skuItems) => {
	try {
		const restockOrder = await RestockOrder_DAO.selectRestockOrderByID(id);
		if (!restockOrder) return {status: 404, body: "restock order not found"};
		if (restockOrder.state !== RestockOrderState.DELIVERED) return {status: 422, body: "restock order is in invalid state"};
		await RestockOrder_DAO.insertRestockOrderSKUItems(id, skuItems);
		return {status: 200, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.updateRestockOrderTransportNote = async (id, deliveryDate) => {
	try {
		const restockOrder = await RestockOrder_DAO.selectRestockOrderByID(id);
		if (!restockOrder) return {status: 404, body: "restock order not found"};
		if (restockOrder.state !== RestockOrderState.DELIVERY) return {status: 422, body: "restock order is in invalid state"};
		if (dayjs(deliveryDate) < dayjs(restockOrder.issueDate)) return {status: 422, body: "delivery date is before issue date"};
		restockOrder.deliveryDate = deliveryDate;
		await RestockOrder_DAO.updateRestockOrder(restockOrder);
		return {status: 200, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.deleteRestockOrder = (id) => {
	return RestockOrder_DAO.deleteRestockOrder(id);
}
