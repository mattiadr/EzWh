const InternalOrderState = Object.freeze({
	ISSUED: "ISSUED",
	ACCEPTED: "ACCEPTED",
	REFUSED: "REFUSED",
	CANCELED: "CANCELED",
	COMPLETED: "COMPLETED",
});


class InternalOrder {
	#id; #issueDate; #state; #customerId; #products;

	constructor(id, issueDate, state, customerId, products) {
		this.#id = id;
		this.#issueDate = issueDate;
		this.#state = state;
		this.#customerId = customerId;
		this.#products = products;
	}

	get id() { return this.#id; }
	get issueDate() { return this.#issueDate; }
	get state() { return this.#state; }
	get customerId() { return this.#customerId; }
	get products() { return this.#products; }

	set id(id) { this.#id = id; }
	set issueDate(issueDate) { this.#issueDate = issueDate; }
	set state(state) { this.#state = state; }
	set customerId(customerId) { this.#customerId = customerId; }
	set products(products) { this.#products = products; }

	assignRFIDs(rfids) {
		const grouped = {};
		rfids.forEach((item) => {
			if (grouped[item.SkuID]) {
				grouped[item.SkuID].push(item.RFID);
			} else {
				grouped[item.SkuID] = [item.RFID];
			}
		});
		for (let i = this.#products.length - 1; i >= 0; i--) {
			const skuid = this.#products[i].SKUId;
			// if we still need to assign rfids, and we have a matching one
			if (this.#products[i].RFID === undefined && grouped[skuid]) {
				// remove element #i
				const [row] = this.#products.splice(i, 1);
				grouped[skuid].forEach((item) => {
					this.#products.push({SKUId: row.SKUId, description: row.description, price: row.price, RFID: item})
				});
			}
		}
	}
}

module.exports.InternalOrderState = InternalOrderState;
module.exports.InternalOrder = InternalOrder;
