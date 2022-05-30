class ReturnOrder {
	#id; #returnDate; #restockOrderId; #products;

	constructor(id, returnDate, restockOrderId, products) {
		this.#id = id;
		this.#returnDate = returnDate;
		this.#restockOrderId = restockOrderId;
		this.#products = products;
	}

	get id() { return this.#id; }
	get returnDate() { return this.#returnDate; }
	get restockOrderId() { return this.#restockOrderId; }
	get products() { return this.#products; }

	set id(returnOrderId) { this.#id = returnOrderId; }
	set returnDate(returnDate) { this.#returnDate = returnDate; }
	set restockOrderId(restockOrderId) { this.#restockOrderId = restockOrderId; }
	set products(products) { this.#products = products; }
}

module.exports = ReturnOrder;
