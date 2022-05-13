'use strict';
const dayjs = require("dayjs")
const Item = require("./Item")

class RestockOrder {
    constructor(id,issueDate,state,products,supplierId,transportNote,skuItems){
        this.id = id; // Integer
        this.issueDate = issueDate; // String
        this.state = state; // StateRestock
        this.products = products; // Collection<Item>
        this.supplierId = supplierId; // Integer
        this.transportNote = transportNote; // TransportNote
        this.skuItems = skuItems; // Collection<SKUItem> 
    }

    removeItem = (item) =>{
        this.products.delete(item);
    }
    modifyQuantity = (item, newQuantity) =>{
        this.products.forEach((k,v) =>{
            if(k===item) v = newQuantity;
        })
    }
    async createItem(id, description,price,SKUId,supplierId) {
        if (typeof id !== 'string' || typeof description !== 'string' 
        || typeof price !== 'number' || typeof SKUId !== 'string' || typeof supplierId !==' number')
            return { status: 422, body: {}, message: {} };

        try {
            let newItem = new Item(id,description,price,SKUId,supplierId)
        } catch (e) {
            return { status: 503, body: {}, message: e };
        }
        return { status: 201, body: {} };
    }

}

module.exports = RestockOrder;

