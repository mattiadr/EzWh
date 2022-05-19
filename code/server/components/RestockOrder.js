'use strict';
const dayjs = require("dayjs")

class RestockOrder {
    #ROID;#issueDate;#state;#products;#supplierId;#transportNote;#skuItems;

    constructor(ROID,issueDate,state,products,supplierId,transportNote){
        this.#ROID = ROID; // Integer
        this.#issueDate = dayjs(issueDate); // String
        this.#state = state; // StateRestock
        this.#products = products;
        this.#supplierId = supplierId; // Integer
        this.#transportNote = transportNote; // TransportNote
        this.#skuItems = new Map(); // Collection<SKUItem>
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

    addItems(items) {
        items.forEach((k,v) => this.#skuItems.set(v,k));
        return this.#skuItems;
    }
    removeItem(itemid) { this.#products.delete(itemid); return this.#products; }
    modifyQuantity(itemid,quantity) { this.#products.set(itemid,quantity); }
    addSkuItems(itemid,quantity) { return this.#products.set(itemid,quantity); }

}

module.exports = RestockOrder;

