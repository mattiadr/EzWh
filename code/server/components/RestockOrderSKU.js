class RestockOrderSKU {
	#ROID; #SKUID; #RFID;

	constructor(ROID, SKUID, RFID) {
		this.#ROID = ROID;
		this.#SKUID = SKUID;
		this.#RFID = RFID;
	}

	getRestockOrderId() { return this.#ROID; }
	getSkuId() { return this.#SKUID; }
	getRFID() { return this.#RFID; }

	setRFID(rfid) { this.#RFID = rfid; }

}

module.exports = RestockOrderSKU;
