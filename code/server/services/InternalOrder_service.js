const InternalOrder = require("../components/InternalOrder");
const InternalOrderProduct = require("../components/InternalOrderProduct");

class InternalOrderService {
	#internalOrder_DAO;

	constructor(internalOrder_DAO) {
		this.#internalOrder_DAO = internalOrder_DAO;
	}

	getInternalOrders = () => {
		return this.#internalOrder_DAO.selectInternalOrders();
	}
	
	getInternalOrdersIssued = () => {
		return this.#internalOrder_DAO.selectInternalOrdersIssued();
	}
	
	getInternalOrdersAccepted = () => {
		return this.#internalOrder_DAO.selectInternalOrdersAccepted();
	}
	
	getInternalOrderByID = () => {
		return this.#internalOrder_DAO.selectInternalOrderByID();
	}
	
	newInternalOrder = async (issueDate, state, customerId) => {
		try {
			await this.#internalOrder_DAO.insertInternalOrder(new InternalOrder(null, issueDate, state, customerId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	updateInternalOrder = async (id, newState) => {
		try {
			const internalOrder = await this.#internalOrder_DAO.selectInternalOrderByID(id);
			if (!internalOrder) return {status: 404, body: "id not found"};
			internalOrder.state = newState;
			await this.#internalOrder_DAO.updateInternalOrder(internalOrder);
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
		return this.#internalOrder_DAO.deleteInternalOrder(id);
	}
	
	/** Internal Order Product **/
	getInternalOrderProductById = (internalOrderProductId) => {
		return this.#internalOrder_DAO.selectInternalOrderProductByID(internalOrderProductId);
	}
	
	getInternalOrderProducts = () => {
		return this.#internalOrder_DAO.selectInternalOrderProducts();
	}
	
	createInternalOrderProduct = async (internalOrderId,ITEMID,quantity) => {
		try {
			let newInternalOrderProduct = new InternalOrderProduct();
			newInternalOrderProduct.internalOrderId = internalOrderId;
			newInternalOrderProduct.ITEMID = ITEMID;
			newInternalOrderProduct.quantity = quantity;
			await this.#internalOrder_DAO.insertInternalOrderProduct(newInternalOrderProduct);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updateInternalOrderProduct = async (internalOrderId,ITEMID,quantity = undefined) => {
		try {
			let internalOrderProduct = await this.#internalOrder_DAO.selectInternalOrderProductByID(internalOrderId);
			if (!internalOrderProduct) return { status: 404, body: "internal order product not found" };
			if (internalOrderId !== undefined && ITEMID !== undefined) {
				internalOrderProduct.quantity = quantity;
			} else {
				internalOrderProduct.internalOrderId = internalOrderId;
				internalOrderProduct.itemId = ITEMID;
				internalOrderProduct.quantity = quantity;
			}
			await this.#internalOrder_DAO.updateInternalOrderProduct(internalOrderId, ITEMID, internalOrderProduct);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}
	
	deleteInternalOrderProduct = (internalOrderProductID) => {
		return this.#internalOrder_DAO.deleteInternalOrderProduct(internalOrderProductID);
	}
}

module.exports = InternalOrderService;
