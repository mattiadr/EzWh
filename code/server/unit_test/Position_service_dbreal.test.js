const Position = require('../components/Position');
const PositionService = require('../services/Position_service');
const testP_dao = require('../database/Position_DAO');
const Position_service = new PositionService(testP_dao);

async function testPositions(expectedPositions) {
    test('get all Positions', async () => {
        let res = await Position_service.getPositions();
        expect(res).toEqual(expectedPositions);
    });
}

async function testPosition(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
    test('get Position', async () => {
        let res = await Position_service.getPositionByID(positionID);
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

// test case definition
describe('get testDescriptors', () => {

    beforeEach(async () => {
        await testP_dao.deletePositionData(); // TODO
        await testP_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
        await testP_dao.insertPosition(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    });

    const Positions = [new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8),
    new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6)];

    testPositions(Positions);
    testPosition(Positions[0].positionID, Positions[0].aisleID, Positions[0].row, Positions[0].col, Positions[0].maxWeight, Positions[0].maxVolume, Positions[0].occupiedWeight, Positions[0].occupiedVolume);
    testPosition(Positions[1].positionID, Positions[1].aisleID, Positions[1].row, Positions[1].col, Positions[1].maxWeight, Positions[1].maxVolume, Positions[1].occupiedWeight, Positions[1].occupiedVolume);
    
});

describe("set Position", () => {

    beforeEach(async () => {
        await testP_dao.deletePositionData(); // TODO
        await testP_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
        await testP_dao.insertPosition(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    });

    test('new Position', async () => {

    });

    test('update Position', async () => {

    });
});

describe("delete Position", () => {

});