const dayjs = require("dayjs")

class RestockOrder {
	#ROID; #issueDate; #state; #supplierId; #transportNote;

	constructor(ROID,issueDate,state,supplierId,transportNote){
		this.#ROID = ROID; // Integer
		this.#issueDate = dayjs(issueDate); // String
		this.#state = state; // StateRestock
		this.#supplierId = supplierId; // Integer
		this.#transportNote = transportNote; // TransportNote
	}

	getRestockOrderId() { return this.#ROID; }
	getIssueDate() { return this.#issueDate; }
	getState() { return this.#state; }
	getSupplierID() { return this.#supplierId; }
	getTransportNote() { return this.#transportNote; }

	setIssueDate(issueDate) { this.#issueDate = issueDate; }
	setState(state) { this.#state = state; }
	setSupplierId(supplierId) { this.#supplierId = supplierId; }
	setTransportNote(transportNote) { this.#transportNote = transportNote; }

}

module.exports = RestockOrder;
