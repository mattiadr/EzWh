'use strict';

class SKU{
    #id;#description;#weight;#volume;#price;#notes;#availableQuantity;#position;#testDescriptors;#itemsID;
    constructor(id, description, weight, volume, price, notes, availableQuantity, position = null){
        this.#id = id;
        this.#description = description;
        this.#weight = weight;
        this.#volume = volume;
        this.#price = price;
        this.#notes = notes;
        this.#availableQuantity = availableQuantity;
        this.#position = position;
        this.#testDescriptors = [];
        this.#itemsID = [];
    }

    getId() { return this.#id; }
    getDescription() { return this.#description; }
    getWeight() { return this.#weight; }
    getVolume() { return this.#volume; }
    getPrice() { return this.#price; }
    getNotes() { return this.#notes; }
    getPosition() { return this.#position; }
    getAvailableQuantity() { return this.#availableQuantity; }
    getTestDescriptors() { return this.#testDescriptors; }
    getItemsID() { return this.#itemsID; }

    setDescription(newDescription) { this.#description = newDescription; }
    setWeight(newWeight) { this.#weight = newWeight; }
    setVolume(newVolume) { this.#volume = newVolume; }
    setPrice(newPrice) { this.#price = newPrice; }
    setNotes(newNotes) { this.#notes = newNotes; }
    setPosition(newPosition) { this.#position = newPosition; }
    setAvailableQuantity(newAvailableQuantity) { this.#availableQuantity = newAvailableQuantity; }
    setTestDescriptors(testDescriptors) { this.#testDescriptors = testDescriptors; }

    addQuantity(sumQuantity) { this.#availableQuantity+=sumQuantity; }
    subQuantity(subQuantity) { this.#availableQuantity-=subQuantity; }
    addTest(newTestID) { this.#testDescriptors.push(newTestID); }
    addItemID(itemID) { this.#itemsID.push(itemID); }
    addSkuItemID(skuItemID) { this.#itemsID.push(skuItemID); }
    extractHeadSKUItem() { 
        const head = this.#itemsID[0];
        this.#itemsID = slice(1, this.#itemsID.length);
        return head;
     }
}

module.exports = SKU;