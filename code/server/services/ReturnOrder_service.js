const ReturnOrder = require("../components/ReturnOrder");
const ReturnOrderProduct = require("../components/ReturnOrderProduct");

class ReturnOrderService {
    #returnOrder_DAO;

    constructor(returnOrder_DAO) {
        this.#returnOrder_DAO = returnOrder_DAO;
    }

	getReturnOrders = () => {
		return this.#returnOrder_DAO.selectReturnOrders();
	}
	
	getReturnOrderByID = (id) => {
		return this.#returnOrder_DAO.selectReturnOrderByID(id);
	}
	
	newReturnOrder = async (returnDate, restockOrderId) => {
		try {
			await this.#returnOrder_DAO.insertReturnOrder(new ReturnOrder(null, returnDate, restockOrderId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteReturnOrder = (id) => {
		return this.#returnOrder_DAO.deleteReturnOrder(id);
	}
	
	/** Return Order Product **/
	
	getReturnOrderProductById = (returnOrderProductId) => {
		return this.#returnOrder_DAO.selectReturnOrderProductByID(returnOrderProductId);
	}
	
	getReturnOrderProducts = () => {
		return this.#returnOrder_DAO.selectReturnOrderProducts();
	}
	
	createReturnOrderProduct = async (returnOrderId,ITEMID,price) => {
		try {
			let newReturnOrderProduct = new ReturnOrderProduct();
			newReturnOrderProduct.returnOrderId = returnOrderId;
			newReturnOrderProduct.ITEMID = ITEMID;
			newReturnOrderProduct.price = price;
			await this.#returnOrder_DAO.insertReturnOrderProduct(newReturnOrderProduct);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updateReturnOrderProduct = async (returnOrderId,ITEMID,price = undefined) => {
		try {
			let returnOrderProduct = await this.#returnOrder_DAO.selectReturnOrderProductByID(returnOrderId);
			if (!returnOrderProduct) return { status: 404, body: "return order product not found" };
			if (returnOrderId !== undefined && ITEMID !== undefined) {
				returnOrderProduct.price = price;
			} else {
				returnOrderProduct.returnOrderId= returnOrderId;
				returnOrderProduct.ITEMID= ITEMID;
				returnOrderProduct.price = price;
			}
			await this.#returnOrder_DAO.updateReturnOrderProduct(returnOrderId, ITEMID, returnOrderProduct);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}
	
	deleteReturnOrderProduct = (returnOrderProductId) => {
		return this.#returnOrder_DAO.deleteReturnOrderProduct(returnOrderProductId);
	}
}


module.exports = ReturnOrderService;
