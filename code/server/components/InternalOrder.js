'use strict'
const dayjs = require("dayjs")

class InternalOrder {
  #internalOrderId; #issueDate; #state; #customerId;
 
  constructor(internalOrderId, issueDate, state, customerId) {
    this.#internalOrderId = internalOrderId;
    this.#issueDate = issueDate;
    this.#state = state;
    this.#customerId = customerId;
  }

  get internalOrderId() { return this.#internalOrderId }
  get issueDate() { return this.#issueDate }
  get state() { return this.#state }
  get customerId() { return this.#customerId }

  set internalOrderId(internalOrderId) { this.#internalOrderId = internalOrderId } 
  set issueDate(issueDate) { this.#issueDate = issueDate } 
  set state(state) { this.#state = state } 
  set customerId(customerId) { this.#customerId = customerId } 

}

module.exports = InternalOrder;
