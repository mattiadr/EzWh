'use strict';
const dayjs = require("dayjs")
const Item = require("./Item")

class RestockOrder {
    constructor(id,issueDate,state,products,supplierId,transportNote,skuItems){
        this.id = id; // Integer
        this.issueDate = dayjs(issueDate); // String
        this.state = state; // StateRestock
        this.supplierId = supplierId; // Integer
        this.transportNote = transportNote; // TransportNote
        this.skuItems = skuItems; // Collection<SKUItem> 
    }
    
}

module.exports = RestockOrder;

