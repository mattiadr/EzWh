const InternalOrder = require("../components/InternalOrder");
const InternalOrderProduct = require("../components/InternalOrderProduct");

const InternalOrder_DAO = require("../database/InternalOrder_DAO");


exports.getInternalOrders = () => {
	return InternalOrder_DAO.selectInternalOrders();
}

exports.getInternalOrdersIssued = () => {
	return InternalOrder_DAO.selectInternalOrdersIssued();
}

exports.getInternalOrdersAccepted = () => {
	return InternalOrder_DAO.selectInternalOrdersAccepted();
}

exports.getInternalOrderByID = () => {
	return InternalOrder_DAO.selectInternalOrderByID();
}

exports.newInternalOrder = async (issueDate, state, customerId) => {
	try {
		await InternalOrder_DAO.insertInternalOrder(new InternalOrder(null, issueDate, state, customerId));
		return {status: 201, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.updateInternalOrder = async (id, newState) => {
	try {
		const internalOrder = await InternalOrder_DAO.selectInternalOrderByID(id);
		if (!internalOrder) return {status: 404, body: "id not found"};
		internalOrder.state = newState;
		await InternalOrder_DAO.updateInternalOrder(internalOrder);
		if (newState === "accepted" || newState === "ACCEPTED") {
			return {status: 200, body: {state: internalOrder.state}};
		} else if (newState === "completed" || newState === "COMPLETED") {
			return {status: 200, body: {state: internalOrder.state}};
		}
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.deleteInternalOrder = (id) => {
	return InternalOrder_DAO.deleteInternalOrder(id);
}

/** Internal Order Product **/
exports.getInternalOrderProductById = (internalOrderProductId) => {
	return InternalOrder_DAO.selectInternalOrderProductByID(internalOrderProductId);
}

exports.getInternalOrderProducts = () => {
	return InternalOrder_DAO.selectInternalOrderProducts();
}

exports.createInternalOrderProduct = async (internalOrderId,ITEMID,quantity) => {
	try {
		let newInternalOrderProduct = new InternalOrderProduct();
		newInternalOrderProduct.internalOrderId = internalOrderId;
		newInternalOrderProduct.ITEMID = ITEMID;
		newInternalOrderProduct.quantity = quantity;
		await InternalOrder_DAO.insertInternalOrderProduct(newInternalOrderProduct);
		return { status: 201, body: {} };
	} catch (e) {
		return { status: 503, body: {}, message: e };
	}
}

exports.updateInternalOrderProduct = async (internalOrderId,ITEMID,quantity = undefined) => {
	try {
		let internalOrderProduct = await InternalOrder_DAO.selectInternalOrderProductByID(internalOrderId);
		if (!internalOrderProduct) return { status: 404, body: "internal order product not found" };
		if (internalOrderId !== undefined && ITEMID !== undefined) {
			internalOrderProduct.quantity = quantity;
		} else {
			internalOrderProduct.internalOrderId = internalOrderId;
			internalOrderProduct.itemId = ITEMID;
			internalOrderProduct.quantity = quantity;
		}
		await InternalOrder_DAO.updateInternalOrderProduct(internalOrderId, ITEMID, internalOrderProduct);
		return { status: 200, body: "" };
	} catch (e) {
		return { status: 503, body: e };
	}
}

exports.deleteInternalOrderProduct = (internalOrderProductID) => {
	return InternalOrder_DAO.deleteInternalOrderProduct(internalOrderProductID);
}
