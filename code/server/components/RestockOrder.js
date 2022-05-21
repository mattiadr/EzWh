const dayjs = require("dayjs")
const Item = require("./Item");

const RestockOrderState = Object.freeze({
	ISSUED: "ISSUED",
	DELIVERY: "DELIVERY",
	DELIVERED: "DELIVERED",
	TESTED: "TESTED",
	COMPLETEDRETURN: "COMPLETEDRETURN",
	COMPLETED: "COMPLETED",
});

class RestockOrder {
	#id; #issueDate; #state; #supplierID; #transportNote; #products; #skuItems;

	constructor(id, issueDate, state, supplierID) {
		this.#id = id;
		this.#issueDate = dayjs(issueDate);
		this.#state = state;
		this.#supplierID = supplierID;
		this.#transportNote = null;
		this.#products = null;
		this.#skuItems = [];
	}

	get id() { return this.#id; }
	get issueDate() { return this.#issueDate.format("YYYY/MM/DD HH:mm"); }
	get state() { return this.#state; }
	get supplierID() { return this.#supplierID; }
	get transportNote() { return this.#state === RestockOrderState.ISSUED ? undefined : {"deliveryDate": this.#transportNote.format("YYYY/MM/DD")}; }
	get products() { return this.#products;	}
	get skuItems() { return this.#skuItems; }

	set id(id) { this.#id = id; }
	set state(state) { this.#state = state; }
	set transportNote(date) { this.#transportNote = dayjs(date); }
	set products(products) { this.#products = products; }

	addSKUItems(skuItems) {
		this.#skuItems.push(...skuItems);
	}
}

module.exports.RestockOrder = RestockOrder;
module.exports.RestockOrderState = RestockOrderState;
