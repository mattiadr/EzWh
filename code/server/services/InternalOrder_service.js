const {InternalOrder, InternalOrderState} = require("../components/InternalOrder");

class InternalOrderService {
	#internalOrder_DAO;

	constructor(internalOrder_DAO) {
		this.#internalOrder_DAO = internalOrder_DAO;
	}

	getInternalOrders() {
		return this.#internalOrder_DAO.selectInternalOrders();
	}

	getInternalOrdersByState(state) {
		return this.#internalOrder_DAO.selectInternalOrdersByState(state);
	}

	getInternalOrderByID(id) {
		return this.#internalOrder_DAO.selectInternalOrderByID(id);
	}

	async newInternalOrder(issueDate, customerId, products) {
		try {
			const correct = products.every((p) => typeof p.SKUId === "number" && typeof p.description === "string" && typeof p.price === "number" && typeof p.qty === "number");
			if (!correct) return {status: 422, body: "bad products"};
			await this.#internalOrder_DAO.insertInternalOrder(new InternalOrder(null, issueDate, InternalOrderState.ISSUED, customerId, products));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	async updateInternalOrder(id, newState, products) {
		try {
			if (!Object.values(InternalOrderState).includes(newState)) return {status: 422, body: "invalid state"};
			const internalOrder = await this.#internalOrder_DAO.selectInternalOrderByID(id);
			if (!internalOrder) return {status: 404, body: "id not found"};

			if (newState === InternalOrderState.COMPLETED) {
				if (!Array.isArray(products)) return {status: 422, body: "bad products"};
				const correct = products.every((p) => typeof p.SkuID === "number" && typeof p.RFID === "string" && p.RFID.length === 32);
				if (!correct) return {status: 422, body: "bad products"};
				internalOrder.assignRFIDs(products);
				await this.#internalOrder_DAO.updateInternalOrderProducts(internalOrder);
			}
			internalOrder.state = newState;
			await this.#internalOrder_DAO.updateInternalOrder(internalOrder);
			return {status: 200, body: ""};
		} catch (e) {
			console.log(e)
			return {status: 503, body: e};
		}
	}

	deleteInternalOrder(id) {
		return this.#internalOrder_DAO.deleteInternalOrder(id);
	}
}

module.exports = InternalOrderService;
