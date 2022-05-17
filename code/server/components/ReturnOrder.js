"use strict";
const dayjs = require("dayjs");

class ReturnOrder {
  #returnOrderId; #returnDate; #restockOrderId;

  constructor(returnOrderId, returnDate, restockOrderId) {
    this.#returnOrderId = returnOrderId;
    this.#returnDate = returnDate;
    this.#restockOrderId = restockOrderId;
  }

  getReturnOrderId() { return this.#returnOrderId }
  getReturnDate() { return this.#returnDate }
  getRestockOrderId() { return this.#restockOrderId }

  setReturnOrderId(returnOrderId) { this.#returnOrderId = returnOrderId } 
  setReturnDate(returnDate) { this.#returnDate = returnDate } 
  setRestockOrderId(restockOrderId) { this.#restockOrderId = restockOrderId } 

}

module.exports = ReturnOrder;
