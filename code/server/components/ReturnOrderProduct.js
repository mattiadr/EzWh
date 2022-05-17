class ReturnOrderProduct {

  #returnOrderId; #ITEMID; #price;

  constructor(returnOrderId, ITEMID, price) {
    this.#returnOrderId = returnOrderId;
    this.#ITEMID = ITEMID;
    this.#price = price;
  }

  get returnOrderId() { return this.#returnOrderId }
  get ITEMID() { return this.#ITEMID }
  get price() { return this.#price }

  set returnOrderId(returnOrderId) { this.#returnOrderId = returnOrderId } 
  set ITEMID(ITEMID) { this.#ITEMID = ITEMID } 
  set price(price) { this.#price = price } 

}

module.exports = ReturnOrderProduct;