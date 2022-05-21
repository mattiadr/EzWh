const dayjs = require("dayjs")

const RestockOrderState = Object.freeze({
	ISSUED: "ISSUED",
	DELIVERY: "DELIVERY",
	DELIVERED: "DELIVERED",
	TESTED: "TESTED",
	COMPLETEDRETURN: "COMPLETEDRETURN",
	COMPLETED: "COMPLETED",
});

class RestockOrder {
	#id; #issueDate; #state; #supplierId; #deliveryDate; #products; #skuItems;

	constructor(id, issueDate, state, supplierId, deliveryDate = null, products = null) {
		this.#id = id;
		this.#issueDate = dayjs(issueDate);
		this.#state = state;
		this.#supplierId = supplierId;
		this.#deliveryDate = dayjs(deliveryDate);
		this.#products = products;
		this.#skuItems = [];
	}

	get id() { return this.#id; }
	get issueDate() { return this.#issueDate.format("YYYY/MM/DD HH:mm"); }
	get state() { return this.#state; }
	get supplierId() { return this.#supplierId; }
	get deliveryDate() { return this.#deliveryDate; }
	get products() { return this.#products;	}
	get skuItems() { return this.#skuItems; }
	get transportNote() { return this.#deliveryDate ? {"deliveryDate": this.#deliveryDate.format("YYYY/MM/DD")} : undefined; }

	set id(id) { this.#id = id; }
	set state(state) { this.#state = state; }
	set deliveryDate(date) { this.#deliveryDate = dayjs(date); }
	set products(products) { this.#products = products; }

	addSKUItems(skuItems) {
		this.#skuItems.push(...skuItems);
	}
}

module.exports.RestockOrder = RestockOrder;
module.exports.RestockOrderState = RestockOrderState;
