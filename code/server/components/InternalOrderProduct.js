class InternalOrderProduct {

  #internalOrderId; #ITEMID; #quantity;

  constructor(internalOrderId, ITEMID, quantity) {
    this.#internalOrderId = internalOrderId;
    this.#ITEMID = ITEMID;
    this.#quantity = quantity;
  }

  getInternalOrderId() { return this.#internalOrderId }
  getItemId() { return this.#ITEMID }
  getquantity() { return this.#quantity }

  setInternalOrderId(internalOrderId) { this.#internalOrderId = internalOrderId } 
  setItemId(ITEMID) { this.#ITEMID = ITEMID } 
  setQuantity(quantity) { this.#quantity = quantity } 

}

module.exports = InternalOrderProduct;