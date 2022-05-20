const ReturnOrder = require("../components/ReturnOrder");
const ReturnOrderProduct = require("../components/ReturnOrderProduct");

class ReturnOrderService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

	getReturnOrders = () => {
		return this.dao.selectReturnOrders();
	}
	
	getReturnOrderByID = (id) => {
		return this.dao.selectReturnOrderByID(id);
	}
	
	newReturnOrder = async (returnDate, restockOrderId) => {
		try {
			await this.dao.insertReturnOrder(new ReturnOrder(null, returnDate, restockOrderId));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteReturnOrder = (id) => {
		return this.dao.deleteReturnOrder(id);
	}
	
	/** Return Order Product **/
	
	getReturnOrderProductById = (returnOrderProductId) => {
		return this.dao.selectReturnOrderProductByID(returnOrderProductId);
	}
	
	getReturnOrderProducts = () => {
		return this.dao.selectReturnOrderProducts();
	}
	
	createReturnOrderProduct = async (returnOrderId,ITEMID,price) => {
		try {
			let newReturnOrderProduct = new ReturnOrderProduct();
			newReturnOrderProduct.returnOrderId = returnOrderId;
			newReturnOrderProduct.ITEMID = ITEMID;
			newReturnOrderProduct.price = price;
			await this.dao.insertReturnOrderProduct(newReturnOrderProduct);
			return { status: 201, body: {} };
		} catch (e) {
			return { status: 503, body: {}, message: e };
		}
	}
	
	updateReturnOrderProduct = async (returnOrderId,ITEMID,price = undefined) => {
		try {
			let returnOrderProduct = await this.dao.selectReturnOrderProductByID(returnOrderId);
			if (!returnOrderProduct) return { status: 404, body: "return order product not found" };
			if (returnOrderId !== undefined && ITEMID !== undefined) {
				returnOrderProduct.price = price;
			} else {
				returnOrderProduct.returnOrderId= returnOrderId;
				returnOrderProduct.ITEMID= ITEMID;
				returnOrderProduct.price = price;
			}
			await this.dao.updateReturnOrderProduct(returnOrderId, ITEMID, returnOrderProduct);
			return { status: 200, body: "" };
		} catch (e) {
			return { status: 503, body: e };
		}
	}
	
	deleteReturnOrderProduct = (returnOrderProductId) => {
		return this.dao.deleteReturnOrderProduct(returnOrderProductId);
	}
}


module.exports = ReturnOrderService;
