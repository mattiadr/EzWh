class Position {

    constructor(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight=0, occupiedVolume=0){
        this.positionID = positionID;
        this.aisleID = aisleID;
        this.row = row;
        this.col = col;
        this.maxWeight = maxWeight;
        this.maxVolume = maxVolume;
        this.occupiedWeight = occupiedWeight;
        this.occupiedVolume = occupiedVolume;
    }
    
    getPositionID() { return this.positionID; }//: String
    getAisleID() { return this.aisleID; }//: String
    getRow() { return this.row; }//: String
    getCol() { return this.col; }//: String
    getMaxWeight() { return this.maxWeight; }//: Double
    getMaxVolume() { return this.maxVolume; }//: Double
    getOccupiedWeight() { return this.occupiedWeight; }//: Double
    getOccupiedVolume() { return this.occupiedVolume; }//: Double

    setPositionID(newPosID) { this.positionID = newPosID; }
    setAisleID(newAisleID /*: String*/) { this.aisleID = newAisleID; }//: void
    setRow(newRow /*: String*/) { this.row = newRow; }// : void
    setCol(newCol /*: String*/) { this.col = newCol; }//: void
    setMaxWeight(newMaxWeight /*: Double*/) { this.maxWeight = newMaxWeight; }// : void
    setMaxVolume(newMaxVolume /*: Double*/) { this.maxVolume = newMaxVolume; }//: void
    setOccupiedWeight(newOccupiedWeight /*: Integer*/) {this.occupiedWeight = newOccupiedWeight; }//: void
    addOccupiedWeight(weight /*: Integer*/) { this.occupiedWeight += weight; }//: void
    subOccupiedWeight(weight /*: Integer*/) { this.occupiedWeight -= weight; }//:void
    setOccupiedVolume(newOccupiedVolume /*: Integer*/) { this.occupiedVolume = newOccupiedVolume; }//: void
    addOccupiedVolume(volume /*: Integer*/) { this.occupiedVolume += volume; }// : void
    subOccupiedVolume(volume /*: Integer*/) { this.occupiedVolume -= volume; }//: void
    setPosition(newPositionID /*: String*/) { this.positionID = newPositionID; }//: void
}

module.exports = Position;