'use strict';

class Item {
    constructor (ITEMID, description,price,SKUId,supplierId) {
        this.ITEMID = ITEMID; // String
        this.description = description; // String
        this.price = price; // Double
        this.SKUId = SKUId; // String
        this.supplierId = supplierId; // Integer
    }
}

module.exports = Item;