class Item {
	#id; #description; #price; #SKUID; #supplierId;

	constructor (id, description, price, SKUID, supplierId) {
		this.#id = id;
		this.#description = description;
		this.#price = price;
		this.#SKUID = SKUID;
		this.#supplierId = supplierId;
	}

	get id() { return this.#id; }
	get description() { return this.#description; }
	get price() { return this.#price; }
	get SKUID() { return this.#SKUID; }
	get supplierId() { return this.#supplierId; }

	set description(value) { this.#description = value; }
	set price(value) { this.#price = value; }
}

module.exports = Item;
