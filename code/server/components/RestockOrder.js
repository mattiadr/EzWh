'use strict';
const dayjs = require("dayjs")

class RestockOrder {
    constructor(ROID,issueDate,state,supplierId,transportNote,skuItems){
        this.ROID = ROID; // Integer
        this.issueDate = dayjs(issueDate); // String
        this.state = state; // StateRestock
        this.supplierId = supplierId; // Integer
        this.transportNote = transportNote; // TransportNote
        this.skuItems = skuItems; // Collection<SKUItem> 
    }
    
    getRestockOrderId() { return this.ROID; }
    getIssueDate() { return this.issueDate; }
    getState() { return this.state; }
    getSupplierID() { return this.supplierId; }
    getTransportNote() { return this.transportNote; }
    getSKUItems() { return this.skuItems; }
    
    setRestockOrderId(ROID) { this.ROID = ROID; }
    setIssueDate(issuedate) { this.issueDate = issuedate; }
    setState(state) { this.state = state; }
    setSupplierID(supplierid) { this.supplierId = supplierid; }
    setTransportNote(transportnote) { this.transportNote = transportnote; }
    setSKUItems(skuitems) { this.skuItems = skuitems; }

}

module.exports = RestockOrder;

