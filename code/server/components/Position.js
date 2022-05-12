class Position {

    constructor(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight=0, occupedVolume=0 /*skuID = undefined*/){
        this.positionID = positionID;
        this.aisleID = aisleID;
        this.row = row;
        this.col = col;
        this.maxWeight = maxWeight;
        this.maxVolume = maxVolume;
        this.occupiedWeight = occupiedWeight;
        this.occupedVolume = occupedVolume;
        //this.SKUId = skuID;
    }
    
    getPositionID() { return this.positionID; }//: String
    getAisleID() { return this.aisleID; }//: String
    getRow() { return this.row; }//: String
    getCol() { return this.col; }//: String
    getMaxWeight() { return this.maxWeight; }//: Double
    getMaxVolume() { return this.maxVolume; }//: Double
    getOccupiedWeight() { return this.occupiedWeight; }//: Double
    getOccupiedVolume() { return this.occupedVolume; }//: Double
    //getSKUID() { return this.SKUId; }
    
    setAisleID(newAisleID /*: String*/) { this.aisleID = newAisleID; }//: void
    setRow(newRow /*: String*/) { this.row = newRow; }// : void
    setCol(newCol /*: String*/) { this.col = newCol; }//: void
    setMaxWeight(newMaxWeight /*: Double*/) { this.maxWeight = newMaxWeight; }// : void
    setMaxVolume(newMaxVolume /*: Double*/) { this.maxVolume = newMaxVolume; }//: void
    setOccupiedWeight(newOccupiedWeight /*: Integer*/) {this.occupiedWeight = newOccupiedWeight; }//: void
    addOccupiedWeight(weight /*: Integer*/) { this.occupiedWeight += weight; }//: void
    subOccupiedWeight(weight /*: Integer*/) { this.occupiedWeight -= weight; }//:void
    setOccupiedVolume(newOccupiedVolume /*: Integer*/) { this.occupedVolume = newOccupiedVolume; }//: void
    addOccupiedVolume(volume /*: Integer*/) { this.occupedVolume += volume; }// : void
    subOccupiedVolume(volume /*: Integer*/) { this.occupedVolume -= volume; }//: void
    setPosition(newPositionID /*: String*/) { this.positionID = newPositionID; }//: void
    //setSKU(newSKUid /*: String*/) { this.SKUId = newSKUid; }//: void  
}

module.exports = Position;