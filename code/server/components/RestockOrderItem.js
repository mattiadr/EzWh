class RestockOrderItem {

    #ROID;#quantity;#description;#price;#SKUId;
  
    constructor(ROID,SKUId,description,price,quantity) {
      this.#ROID = ROID;
      this.#SKUId = SKUId; // String
      this.#description = description; // String
      this.#price = price; // Double
      this.#quantity = quantity;
       
    }
  
    getRestockOrderId() { return this.#ROID; }
    getQuantity() { return this.#quantity; }
    getDescription() { return this.#description; }
    getPrice() { return this.#price; }
    getSKUId() { return this.#SKUId; }
    
    setDescription(description) { this.#description = description; }
    setPrice(price) { this.#price = price; }
    setRestockOrderId(roid) { this.#ROID = roid; }
    setQuantity(quantity) { this.#quantity = quantity; }
  
  }
  
  module.exports = RestockOrderItem;