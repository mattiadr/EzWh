class InternalOrderProduct {

  #internalOrderId; #ITEMID; #quantity;

  constructor(internalOrderId, ITEMID, quantity) {
    this.#internalOrderId = internalOrderId;
    this.#ITEMID = ITEMID;
    this.#quantity = quantity;
  }

  get internalOrderId() { return this.#internalOrderId }
  get ITEMID() { return this.#ITEMID }
  get quantity() { return this.#quantity }

  set internalOrderId(internalOrderId) { this.#internalOrderId = internalOrderId } 
  set ITEMID(ITEMID) { this.#ITEMID = ITEMID } 
  set quantity(quantity) { this.#quantity = quantity } 

}

module.exports = InternalOrderProduct;