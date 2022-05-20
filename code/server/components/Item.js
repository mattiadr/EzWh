class Item {
	#id; #description; #price; #SKUID; #supplierID;

	constructor (id, description, price, SKUID, supplierID) {
		this.#id = id;
		this.#description = description;
		this.#price = price;
		this.#SKUID = SKUID;
		this.#supplierID = supplierID;
	}

	get id() { return this.#id; }
	get description() { return this.#description; }
	get price() { return this.#price; }
	get SKUID() { return this.#SKUID; }
	get supplierID() { return this.#supplierID; }

	set description(value) { this.#description = value; }
	set price(value) { this.#price = value; }
}

module.exports = Item;
