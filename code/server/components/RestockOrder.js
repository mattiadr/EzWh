'use strict';
const dayjs = require("dayjs")

class RestockOrder {
    #ROID;#issueDate;#state;#products;#supplierId;#transportNote;#skuItems;

    constructor(ROID,issueDate,state,supplierId,transportNote,skuItems){
        this.#ROID = ROID; // Integer
        this.#issueDate = dayjs(issueDate); // String
        this.#state = state; // StateRestock
        this.#products = new Map();
        this.#supplierId = supplierId; // Integer
        this.#transportNote = transportNote; // TransportNote
        this.#skuItems = skuItems; // Collection<SKUItem>
    }
    
    getRestockOrderId() { return this.#ROID; }
    getIssueDate() { return this.#issueDate; }
    getState() { return this.#state; }
    getProducts() { return this.#products;}
    getSupplierID() { return this.#supplierId; }
    getTransportNote() { return this.#transportNote; }
    getSKUItems() { return this.#skuItems; }
    
    setIssueDate(issuedate) { this.#issueDate = issuedate; }
    setState(state) { this.#state = state; }
    setSupplierId(supplierid) { this.#supplierId = supplierid; }
    setTransportNote(transportnote) { this.#transportNote = transportnote; }
    setSKUItems(skuitems) { this.#skuItems = skuitems; }
    addItem(item,quantity) { this.#products.set(item,quantity); }
    removeItem(item) { this.#products.delete(item); }
    modifyQuantity(item,quantity) { this.#products.set(item,quantity); }

}

module.exports = RestockOrder;

