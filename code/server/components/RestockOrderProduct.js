class ROProduct {
    constructor(ROID, ITEMID, quantity){
        this.ROID = ROID; 
        this.ITEMID = ITEMID;
        this.quantity = quantity; 
    }

    getRestockOrderId() { return this.ROID; }
    getItemID() { return this.ITEMID; }
    getQuantity() { return this.quantity; }

    setRestockOrderId(ROID) { this.ROID = ROID; }
    setItemID(ITEMID) { this.ITEMID = ITEMID; }
    setQuantity(quantity) { this.quantity = quantity; }

 
}

module.exports = RestockOrder;