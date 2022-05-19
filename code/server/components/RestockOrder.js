'use strict';
const dayjs = require("dayjs")

class RestockOrder {
    #ROID;#issueDate;#state;#supplierId;#transportNote;

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
    
    setIssueDate(issuedate) { this.#issueDate = issuedate; }
    setState(state) { this.#state = state; }
    setSupplierId(supplierid) { this.#supplierId = supplierid; }
    setTransportNote(transportnote) { this.#transportNote = transportnote; }

}

module.exports = RestockOrder;

