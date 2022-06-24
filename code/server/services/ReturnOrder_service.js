const ReturnOrder = require("../components/ReturnOrder");


class ReturnOrderService {
	#returnOrder_DAO;
	#restockOrder_DAO;

	constructor(returnOrder_DAO, restockOrder_DAO) {
		this.#returnOrder_DAO = returnOrder_DAO;
		this.#restockOrder_DAO = restockOrder_DAO;
	}

	getReturnOrders() {
		return this.#returnOrder_DAO.selectReturnOrders();
	}

	getReturnOrderByID(id) {
		return this.#returnOrder_DAO.selectReturnOrderByID(id);
	}

	async newReturnOrder(returnDate, products, restockOrderId) {
		try {
			const restockOrder = await this.#restockOrder_DAO.selectRestockOrderByID(restockOrderId);
			if (!restockOrder) return {status: 404, body: "restock order not found"};
			const correct = products.every((p) => typeof p.SKUId === "number" && typeof p.itemId === "number"
				&& typeof p.description === "string" && typeof p.price === "number" && typeof p.RFID === "string" && p.RFID.length === 32);
			if (!correct) return {status: 422, body: "bad products"};
			await this.#returnOrder_DAO.insertReturnOrder(new ReturnOrder(null, returnDate, restockOrderId, products));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	deleteReturnOrder(id) {
		return this.#returnOrder_DAO.deleteReturnOrder(id);
	}
}

module.exports = ReturnOrderService;
