const testP_dao = require('../database/Position_DAO');
const Position = require('../components/Position');

async function testPositions(expectedPositions) {
    test('get all Positions', async () => {
        let res = await testP_dao.selectPositions();
        expect(res).toEqual(expectedPositions);
    });
}

async function testPosition(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
    test('get Position', async () => {
        let res = await testP_dao.selectPositionByID(id);
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
        await testP_dao.insertPosition(new Position(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume));
        let res = await testP_dao.selectPositions();
        expect(res.length).toStrictEqual(1);
        res = await testP_dao.selectPositionsByID(positionID);
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
        let res = await testP_dao.selectPositionByID(positionID);
        expect(res).not.toBeNull();
        res.aisleID = aisleID;
        res.row = row;
        res.col = col;
        res.maxWeight = maxWeight;
        res.maxVolume = maxVolume;
        res.occupiedWeight = occupiedWeight;
        res.occupiedVolume = occupiedVolume;
        await testPD_dao.updatePosition(res);
        res = await testD_dao.selectPositionByID(positionID);
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
        let res = await testD_dao.selectPositionByID(positionID);
        expect(res.positionID).toStrictEqual(positionID);
        expect(res.aisleID).toStrictEqual(aisleID);
        expect(res.row).toStrictEqual(row);
        expect(res.col).toStrictEqual(col);
        expect(res.maxWeight).toStrictEqual(maxWeight);
        expect(res.maxVolume).toStrictEqual(maxVolume);
        expect(occupiedWeight).toStrictEqual(occupiedWeight);
        expect(occupiedVolume).toStrictEqual(occupiedVolume);
        await testP_dao.deletePosition(id);
        res = await testP_dao.selectPositionByID(id);
        expect(res).toBeNull();
    });
}

describe("testDao_selectPositions", () => {
    beforeEach(async () => {
        await testP_dao.deletePosition();
        await testP_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
        await testP_dao.insertPosition(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    });

    testPositions([ new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8),
        new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6)]);
    testPosition(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
    testPosition(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);
    testPositionByID(1);
    
});

describe('testDao_newPosition', () => {
    beforeEach(async () => {
        await testP_dao.deletePosition();
    });

    test('db is empty', async () => {
        const res = await testP_dao.selectPositions();
        expect(res.length).toStrictEqual(0);
    });

    testNewPosition(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
});

describe('testDao_updatePosition', () => {
    beforeAll(async () => {
        await testP_dao.deletePosition();
        await testP_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
    });

    testUpdatePosition(1, "AID01670", "K102", "G560", 800, 60, 635.50, 51.0);
});

describe("testDao_deletePosition", () => {
    beforeEach(async () => {
        await testD_dao.deletePosition();
        await testD_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
        await testD_dao.insertPosition(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    });
    testDeletePosition(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
    testDeletePosition(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);
    //testDeletePosition(3, "AID04994", "F108", "J300", 800, 60, 100.50, 2.4); // -> this test will fail
});


