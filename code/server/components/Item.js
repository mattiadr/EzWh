'use strict';

class Item {
    #ITEMID;#description;#price;#SKUId;#supplierId;
    constructor (ITEMID, description,price,SKUId,supplierId) {
        this.#ITEMID = ITEMID; // String
        this.#description = description; // String
        this.#price = price; // Double
        this.#SKUId = SKUId; // String
        this.#supplierId = supplierId; // Integer
    }

    getItemId() { return this.#ITEMID; }
    getDescription() { return this.#description; }
    getPrice() { return this.#price; }
    getSKUId() { return this.#SKUId; }
    getSupplierId() { return this.#supplierId; }

    setItemId(itemid) { this.#ITEMID = itemid; }
    setDescription(description) { this.#description = description; }
    setPrice(price) { this.#price = price; }
    setSKUId(skuid) { this.#SKUId = skuid; }
    setSupplierId(supplierid) { this.#supplierId = supplierid; }
    
}

module.exports = Item;