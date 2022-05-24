const Position = require('../components/Position');
const PositionService = require('../services/Position_service');
const P_dao = require('../database/Position_DAO');
const Position_service = new PositionService(P_dao);

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
        await P_dao.deletePositionData(); // TODO
        await P_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
        await P_dao.insertPosition(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    });

    const Positions = [new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8),
    new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6)];

    testPositions(Positions);
    testPosition(Positions[0].positionID, Positions[0].aisleID, Positions[0].row, Positions[0].col, Positions[0].maxWeight, Positions[0].maxVolume, Positions[0].occupiedWeight, Positions[0].occupiedVolume);
    testPosition(Positions[1].positionID, Positions[1].aisleID, Positions[1].row, Positions[1].col, Positions[1].maxWeight, Positions[1].maxVolume, Positions[1].occupiedWeight, Positions[1].occupiedVolume);
    
});

describe("set Position", () => {

    beforeEach(async () => {
        await P_dao.deletePositionData(); // TODO
        await P_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
        await P_dao.insertPosition(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    });

    test('new Position', async () => {
        const Pos1 = new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
        const Pos2 = new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);

        let res = await Position_service.createPosition(Pos1.aisleID, Pos1.row, Pos1.col, Pos1.maxWeight, Pos1.maxVolume, Pos1.occupiedWeight, Pos1.occupiedVolume);
        expect(res.status).toEqual(201);
        res = await Position_service.getPositionByID(Pos1.id);
        expect(res).toEqual(Pos1);

        res = await Position_service.createTestDescriptor(Pos2.aisleID, Pos2.row, Pos2.col, Pos2.maxWeight, Pos2.maxVolume, Pos2.occupiedWeight, Pos2.occupiedVolume);
        expect(res.status).toEqual(404);
        res = await Position_service.getPositionByID(Pos2.id);
        expect(res).toBeNull();
    });

    test('update Position', async () => {
        const Pos1 = new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
        const Pos2 = new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);       
        const Pos3 = new Position(3, "AID04994", "F108", "J300", 800, 60, 100.50, 2.4);
        
        let res = await Position_service.updatePosition(Pos1.aisleID, Pos1.row, Pos1.col, Pos1.maxWeight, Pos1.maxVolume, Pos1.occupiedWeight, Pos1.occupiedVolume);
        expect(res.status).toEqual(200);
        res = await Position_service.getPositionByID(Pos1.positionID);
        expect(res).toEqual(Pos1);

        res = await Position_service.updatePosition(Pos2.aisleID, Pos2.row, Pos2.col, Pos2.maxWeight, Pos2.maxVolume, Pos2.occupiedWeight, Pos2.occupiedVolume);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("position not found");
        res = await Position_service.getPositionByID(Pos2.positionID);
        expect(res).toEqual({});

        res = await Position_service.updatePosition(Pos3.aisleID, Pos3.row, Pos3.col, Pos3.maxWeight, Pos3.maxVolume, Pos3.occupiedWeight, Pos3.occupiedVolume);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
        res = await Position_service.getPositionByID(Pos3.positionID);
        expect(res).toBeNull();
    });
});

describe("delete Position", () => {
    beforeEach(async () => {
        await P_dao.deletePositionData();
        await P_dao.insertPosition(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));
    });
    test('delete Position', async () => {
        const idPos = 1;
        let res = await Position_service.deleteTestDescriptor(idPos);
        expect(res).toEqual(true);
        res = await Position_service.getTestDescriptorByID(idPos);
        expect(res).toBeNull();

    });
});