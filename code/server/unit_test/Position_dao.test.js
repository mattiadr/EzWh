const P_dao = require('../database/Position_DAO');
const Position = require('../components/Position');

async function testPositions(expectedPositions) {
    test('get all Positions', async () => {
        let res = await P_dao.selectPositions();
        expect(res).toEqual(expectedPositions);
    });
}

async function testPosition(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
    test('get Position', async () => {
        let res = await P_dao.selectPositionByID(id);
        expect(res.positionID).toStrictEqual(positionID);
        expect(res.aisleID).toStrictEqual(aisleID);
        expect(res.row).toStrictEqual(row);
        expect(res.col).toStrictEqual(col);
        expect(res.maxWeight).toStrictEqual(maxWeight);
        expect(res.maxVolume).toStrictEqual(maxVolume);
        expect(occupiedWeight).toStrictEqual(occupiedWeight);
        expect(occupiedVolume).toStrictEqual(occupiedVolume);
    });
}



async function testNewPosition(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume){ //TESTING SELECT AND INSERT QUERY
    test('create new Position', async () => {
        await P_dao.insertPosition(new Position(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume));
        let res = await P_dao.selectPositions();
        expect(res.length).toStrictEqual(1);
        res = await P_dao.selectPositionsByID(positionID);
        expect(res.positionID).toStrictEqual(positionID);
        expect(res.aisleID).toStrictEqual(aisleID);
        expect(res.row).toStrictEqual(row);
        expect(res.col).toStrictEqual(col);
        expect(res.maxWeight).toStrictEqual(maxWeight);
        expect(res.maxVolume).toStrictEqual(maxVolume);
        expect(occupiedWeight).toStrictEqual(occupiedWeight);
        expect(occupiedVolume).toStrictEqual(occupiedVolume);
    });
}

async function testUpdatePosition(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume){ //TESTING SELECT AND INSERT QUERY
    test('update a Position', async () => {
        let res = await P_dao.selectPositionByID(positionID);
        expect(res).not.toBeNull();
        res.aisleID = aisleID;
        res.row = row;
        res.col = col;
        res.maxWeight = maxWeight;
        res.maxVolume = maxVolume;
        res.occupiedWeight = occupiedWeight;
        res.occupiedVolume = occupiedVolume;
        await testPD_dao.updatePosition(res);
        res = await P_dao.selectPositionByID(positionID);
        expect(res.positionID).toStrictEqual(positionID);
        expect(res.aisleID).toStrictEqual(aisleID);
        expect(res.row).toStrictEqual(row);
        expect(res.col).toStrictEqual(col);
        expect(res.maxWeight).toStrictEqual(maxWeight);
        expect(res.maxVolume).toStrictEqual(maxVolume);
        expect(occupiedWeight).toStrictEqual(occupiedWeight);
        expect(occupiedVolume).toStrictEqual(occupiedVolume);
    });
}

async function testDeletePosition(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
    test('delete Position', async () => {
        let res = await P_dao.selectPositionByID(positionID);
        expect(res.positionID).toStrictEqual(positionID);
        expect(res.aisleID).toStrictEqual(aisleID);
        expect(res.row).toStrictEqual(row);
        expect(res.col).toStrictEqual(col);
        expect(res.maxWeight).toStrictEqual(maxWeight);
        expect(res.maxVolume).toStrictEqual(maxVolume);
        expect(occupiedWeight).toStrictEqual(occupiedWeight);
        expect(occupiedVolume).toStrictEqual(occupiedVolume);
        await P_dao.deletePosition(id);
        res = await P_dao.selectPositionByID(id);
        expect(res).toBeNull();
    });
}

describe("positionDao_selectPositions", () => {
    beforeEach(async () => {
        await P_dao.deletePositionData(); 
        await P_dao.insertPosition(new Position("800234543412","8002","3454",1000,1000,300,150));
        await P_dao.insertPosition(new Position("80123454312","8012","3454","3412",1000,1000,300,150));
    });

    testPositions([ new Position("800234543412","8002","3454",1000,1000,300,150),
                            new Position("80123454312","8012","3454","3412",1000,1000,300,150)]);
    testPosition("800234543412","8002","3454",1000,1000,300,150);
    testPosition("80123454312","8012","3454","3412",1000,1000,300,150);
    //testPosition("80223454312","8022","3454","3412",1000,1000,300,150); // -> this test will fail

});

describe('positionDao_newPosition', () => {
    beforeEach(async () => {
        await P_dao.deletePositionData(); 
    });

    test('db is empty', async () => {
        const res = await P_dao.selectPositions();
        expect(res.length).toStrictEqual(0);
    });

    testNewPosition("800234543412","8002","3454","3412",1000,1000,300,150);
});

describe('positionDao_updatePosition', () => {
    beforeAll(async () => {
        await P_dao.deletePositionData(); 
        await P_dao.insertPosition(new Position("800234543412","8002","3454",1000,1000,300,150));
    });

    testUpdatePosition("800234543412","8002","3454","3412",1000,1000,300,150);
});

describe("positionDao_deletePosition", () => {
    beforeEach(async () => {
        await P_dao.deletePositionData(); // TODO
        await P_dao.insertPosition(new Position("800234543412","8002","3454",1000,1000,300,150));
        await P_dao.insertPosition(new Position("80123454312","8012","3454","3412",1000,1000,300,150));
    });
    testDeletePosition("800234543412","8002","3454",1000,1000,300,150);
    testDeletePosition("80123454312","8012","3454","3412",1000,1000,300,150);
    //testDeletePosition("80223454312","8022","3454","3412",1000,1000,300,150); // -> this test will fail
});


