'use strict';
const dayjs = require("dayjs");

class SKU{

    constructor(id, description, weight, volume, price, notes, availableQuantity, position = null){
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.price = price;
        this.notes = notes;
        this.availableQuantity = availableQuantity;
        this.position = position;
        this.testDescriptors = [];
        this.itemsID = [];
        this.sku_itemsID = [];
    }

    getId() { return this.id; }
    getDescription() { return this.description; }
    getWeight() { return this.weight; }
    getVolume() { return this.volume; }
    getPrice() { return this.price; }
    getNotes() { return this.notes; }
    getPosition() { return this.position; }
    getAvailableQuantity() { return this.availableQuantity; }
    getTestDescriptors() { return this.testDescriptors; }
    getItemsID() { return this.itemsID; }
    getSkuItemsID() { return this.sku_itemsID; }

    setDescription(newDescription) { this.description = newDescription; }
    setWeight(newWeight) { this.weight = newWeight; }
    setVolume(newVolume) { this.volume = newVolume; }
    setPrice(newPrice) { this.price = newPrice; }
    setNotes(newNotes) { this.notes = newNotes; }
    setPosition(newPosition) { this.position = newPosition; }
    setAvailableQuantity(newAvailableQuantity) { this.availableQuantity = newAvailableQuantity; }

    addQuantity(sumQuantity) { this.addQuantity+=sumQuantity; }
    subQuantity(subQuantity) { this.addQuantity-=subQuantity; }
    addTest(newTestID) { this.testDescriptors.push(newTestID); }
    addItemID(itemID) { this.itemsID.push(itemID); }
    addSkuItemID(skuItemID) { this.sku_itemsID.push(skuItemID); }
    extractHeadSKUItem() { 
        const head = this.sku_itemsID[0];
        this.sku_itemsID = slice(1, this.sku_itemsID.length);
        return head;
     }
}

module.exports = SKU;