const InternalOrder = require("../components/InternalOrder");
const InternalOrderProduct = require("../components/InternalOrderProduct");

class InternalOrderService {
	dao
	constructor(dao) {
		this.dao = dao;
	}

	getInternalOrders = () => {
		return this.dao.selectInternalOrders();
	}
	
	getInternalOrdersIssued = () => {
		return this.dao.selectInternalOrdersIssued();
	}
	
	getInternalOrdersAccepted = () => {
		return this.dao.selectInternalOrdersAccepted();
	}
	
	getInternalOrderByID = () => {
		return this.dao.selectInternalOrderByID();
	}
	
	newInternalOrder = async (issueDate, state, customerId) => {
		try {
			await this.dao.insertInternalOrder(new InternalOrder(null, issueDate, state, customerId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	updateInternalOrder = async (id, newState) => {
		try {
			const internalOrder = await this.dao.selectInternalOrderByID(id);
			if (!internalOrder) return {status: 404, body: "id not found"};
			internalOrder.state = newState;
			await this.dao.updateInternalOrder(internalOrder);
			if (newState === "accepted" || newState === "ACCEPTED") {
				return {status: 200, body: {state: internalOrder.state}};
			} else if (newState === "completed" || newState === "COMPLETED") {
				return {status: 200, body: {state: internalOrder.state}};
			}
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteInternalOrder = (id) => {
		return this.dao.deleteInternalOrder(id);
	}
	
	/** Internal Order Product **/
	getInternalOrderProductById = (internalOrderProductId) => {
		return this.dao.selectInternalOrderProductByID(internalOrderProductId);
	}
	
	getInternalOrderProducts = () => {
		return this.dao.selectInternalOrderProducts();
	}
	
	createInternalOrderProduct = async (internalOrderId,ITEMID,quantity) => {
		try {
			let newInternalOrderProduct = new InternalOrderProduct();
			newInternalOrderProduct.internalOrderId = internalOrderId;
			newInternalOrderProduct.ITEMID = ITEMID;
			newInternalOrderProduct.quantity = quantity;
			await this.dao.insertInternalOrderProduct(newInternalOrderProduct);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updateInternalOrderProduct = async (internalOrderId,ITEMID,quantity = undefined) => {
		try {
			let internalOrderProduct = await this.dao.selectInternalOrderProductByID(internalOrderId);
			if (!internalOrderProduct) return { status: 404, body: "internal order product not found" };
			if (internalOrderId !== undefined && ITEMID !== undefined) {
				internalOrderProduct.quantity = quantity;
			} else {
				internalOrderProduct.internalOrderId = internalOrderId;
				internalOrderProduct.itemId = ITEMID;
				internalOrderProduct.quantity = quantity;
			}
			await this.dao.updateInternalOrderProduct(internalOrderId, ITEMID, internalOrderProduct);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}
	
	deleteInternalOrderProduct = (internalOrderProductID) => {
		return this.dao.deleteInternalOrderProduct(internalOrderProductID);
	}
}

module.exports = InternalOrderService;
