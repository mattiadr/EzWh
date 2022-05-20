class ReturnOrder {
	#returnOrderId; #returnDate; #restockOrderId;

	constructor(returnOrderId, returnDate, restockOrderId) {
		this.#returnOrderId = returnOrderId;
		this.#returnDate = returnDate;
		this.#restockOrderId = restockOrderId;
	}

	get returnOrderId() { return this.#returnOrderId }
	get returnDate() { return this.#returnDate }
	get restockOrderId() { return this.#restockOrderId }

	set returnOrderId(returnOrderId) { this.#returnOrderId = returnOrderId }
	set returnDate(returnDate) { this.#returnDate = returnDate }
	set restockOrderId(restockOrderId) { this.#restockOrderId = restockOrderId }

}

module.exports = ReturnOrder;
