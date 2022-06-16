const dayjs = require("dayjs");

const {RestockOrder, RestockOrderState} = require("../components/RestockOrder");

class RestockOrderService {
	#restockOrder_DAO; #item_DAO;

	constructor(restockOrder_DAO, item_DAO) {
		this.#restockOrder_DAO = restockOrder_DAO;
		this.#item_DAO = item_DAO;
	}

	getRestockOrders() {
		return this.#restockOrder_DAO.selectRestockOrders();
	}

	getRestockOrdersByState(state) {
		return this.#restockOrder_DAO.selectRestockOrdersByState(state);
	}

	getRestockOrderByID(id) {
		return this.#restockOrder_DAO.selectRestockOrderByID(id);
	}

	async getRestockOrderByIDReturnItems(id) {
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

	async createRestockOrder(issueDate, supplierId, products) {
		try {
			for (let p of products) {
				if (!(typeof p.SKUId === "number" && typeof p.itemId === "number" && typeof p.description === "string" && typeof p.price === "number" && typeof p.qty === "number")) return {status: 422, body: ""};
				const item = await this.#item_DAO.selectItemByID(p.itemId, supplierId);
				if (item === null || item === undefined) return {status: 422, body: ""};
				else if (item.SKUID !== p.SKUId) return {status: 422, body: ""};
			};
			const restockOrder = new RestockOrder(null, issueDate, RestockOrderState.ISSUED, supplierId, null, products);
			const correct = await products.every(async (p) => {
				// check if all fields are present
				if (!(typeof p.SKUId === "number" && typeof p.itemId === "number" && typeof p.description === "string" && typeof p.price === "number" && typeof p.qty === "number")) return false;
				const item = await this.#item_DAO.selectItemByID(p.itemId, supplierId);
				// check if supplier sells this product
				if (!item) return false;
				// check if skuid matches item
				return item.SKUID === p.SKUId;
			});
			if (!correct) return {status: 422, body: "bad products"};
			await this.#restockOrder_DAO.insertRestockOrder(restockOrder);
			return {status: 201, body: ""};
		} catch (e) {
			console.log(e)
			return {status: 503, body: e};
		}
	}

	async updateRestockOrderState(id, newState) {
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

	async addSkuItemsToRestockOrder(id, skuItems) {
		try {
			const restockOrder = await this.#restockOrder_DAO.selectRestockOrderByID(id);
			if (!restockOrder) return {status: 404, body: "restock order not found"};
			if (restockOrder.state !== RestockOrderState.DELIVERED) return {
				status: 422,
				body: "restock order is in invalid state"
			};
			const correct = skuItems.every((skuItem) => typeof skuItem.SKUId === "number" && typeof skuItem.itemId === "number" && typeof skuItem.rfid === "string" && skuItem.rfid.length === 32);
			if (!correct) return {status: 422, body: "bad skuItems"};
			await this.#restockOrder_DAO.insertRestockOrderSKUItems(id, skuItems);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}

	async updateRestockOrderTransportNote(id, deliveryDate) {
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

	deleteRestockOrder(id) {
		return this.#restockOrder_DAO.deleteRestockOrder(id);
	}
}

module.exports = RestockOrderService;
