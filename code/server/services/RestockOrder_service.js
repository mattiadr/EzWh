const RestockOrder = require("../components/RestockOrder");
const RestockOrderItem = require("../components/RestockOrderItem");

class RestockOrderService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

	getRestockOrderByID = (restockOrderID) => {
		return this.dao.selectRestockOrderByID(restockOrderID);
	}
	
	getRestockOrders = () => {
		return this.dao.selectRestockOrders();
	}
	
	getRestockOrdersIssued = () => {
		return this.dao.selectRestockOrdersIssued();
	}
	
	createRestockOrder = async (issueDate,SKUId,description,price,quantity,supplierId) => {
		try {
			let ROID = 10*Math.random();
			await this.dao.insertRestockOrder(new RestockOrder(ROID,issueDate,'issued',supplierId,null),
			new RestockOrderItem(ROID,SKUId,description,price,quantity));
			return { status: 201, body: {} };
		} catch (e) {
			console.log("exception", e);
			return {status: 503, body: e};
		}
	}
	
	deleteRestockOrder = (restockOrderID) => {
		return this.dao.deleteRestockOrder(restockOrderID);
	}
	
}

module.exports = RestockOrderService;
