class ReturnOrderProduct {

  #returnOrderId; #ITEMID; #price;

  constructor(returnOrderId, ITEMID, price) {
    this.#returnOrderId = returnOrderId;
    this.#ITEMID = ITEMID;
    this.#price = price;
  }

  getReturnOrderId() { return this.#returnOrderId }
  getItemId() { return this.#ITEMID }
  getPrice() { return this.#price }

  setReturnOrderId(returnOrderId) { this.#returnOrderId = returnOrderId } 
  setItemId(ITEMID) { this.#ITEMID = ITEMID } 
  setPrice(price) { this.#price = price } 

}

module.exports = ReturnOrderProduct;