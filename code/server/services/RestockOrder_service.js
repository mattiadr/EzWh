const dayjs = require("dayjs");

const {RestockOrder, RestockOrderState} = require("../components/RestockOrder");

class RestockOrderService {
	#restockOrder_DAO;

    constructor(restockOrder_DAO) {
        this.#restockOrder_DAO = restockOrder_DAO;
    }

	getRestockOrders = () => {
		return this.#restockOrder_DAO.selectRestockOrders();
	}

	getRestockOrdersByState = (state) => {
		return this.#restockOrder_DAO.selectRestockOrdersByState(state);
	}

	getRestockOrderByID = (id) => {
		return this.#restockOrder_DAO.selectRestockOrderByID(id);
	}

	getRestockOrderByIDReturnItems = async (id) => {
		try {
			const restockOrder = await this.#restockOrder_DAO.selectRestockOrderByID(id);
			if (!restockOrder) return {status: 404, body: "restock order not found"};
			if (restockOrder.state !== RestockOrderState.COMPLETEDRETURN) return {
				status: 422,
				body: "restock order is in invalid state"
			};
			const returnItems = await this.#restockOrder_DAO.selectRestockOrderByIDReturnItems(id);
			return {status: 200, body: returnItems};
		} catch (e) {
			return {status: 500, body: e};
		}
	}

	createRestockOrder = async (issueDate, supplierId, products) => {
		try {
			const restockOrder = new RestockOrder(null, issueDate, RestockOrderState.ISSUED, supplierId, null, products);
			await this.#restockOrder_DAO.insertRestockOrder(restockOrder);
			return {status: 201, body: ""};
		} catch (e) {
			console.log(e)
			return {status: 503, body: e};
		}
	}

	updateRestockOrderState = async (id, newState) => {
		try {
			if (!Object.values(RestockOrderState).includes(newState)) return {status: 422, body: "invalid state"};
			const restockOrder = await this.#restockOrder_DAO.selectRestockOrderByID(id);
			if (!restockOrder) return {status: 404, body: "restock order not found"};
			restockOrder.state = newState;
			await this.#restockOrder_DAO.updateRestockOrder(restockOrder);
			return {status: 200, body: ""};
		} catch (e) {
			console.log(e)
			return {status: 503, body: e};
		}
	}

	addSkuItemsToRestockOrder = async (id, skuItems) => {
		try {
			const restockOrder = await this.#restockOrder_DAO.selectRestockOrderByID(id);
			if (!restockOrder) return {status: 404, body: "restock order not found"};
			if (restockOrder.state !== RestockOrderState.DELIVERED) return {
				status: 422,
				body: "restock order is in invalid state"
			};
			await this.#restockOrder_DAO.insertRestockOrderSKUItems(id, skuItems);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	updateRestockOrderTransportNote = async (id, deliveryDate) => {
		try {
			const restockOrder = await this.#restockOrder_DAO.selectRestockOrderByID(id);
			if (!restockOrder) return {status: 404, body: "restock order not found"};
			if (restockOrder.state !== RestockOrderState.DELIVERY) return {
				status: 422,
				body: "restock order is in invalid state"
			};
			if (dayjs(deliveryDate) < dayjs(restockOrder.issueDate)) return {
				status: 422,
				body: "delivery date is before issue date"
			};
			restockOrder.deliveryDate = deliveryDate;
			await this.#restockOrder_DAO.updateRestockOrder(restockOrder);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	deleteRestockOrder = (id) => {
		return this.#restockOrder_DAO.deleteRestockOrder(id);
	}

	deleteRestockOrders = () => {
		return this.#restockOrder_DAO.deleteRestockOrderData();
	}
}

module.exports = RestockOrderService;
