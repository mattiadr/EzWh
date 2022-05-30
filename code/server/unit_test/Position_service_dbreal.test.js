const Position = require('../components/Position');
const PositionService = require('../services/Position_service');
const P_dao = require('../database/Position_DAO');
const Position_service = new PositionService(P_dao);
const DatabaseConnection = require("../database/DatabaseConnection");

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
describe('get Positions', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await P_dao.deletePositionData(); 
        await P_dao.insertPosition(new Position(1,"800234543412","8002","3454",1000,1000,300,150));
        await P_dao.insertPosition(new Position(2,"80123454312","8012","3412",1000,1000,300,150));
    });

    const Positions = [new Position(1,"800234543412","8002","3454",1000,1000,300,150),
    new Position(2,"80123454312","8012","3412",1000,1000,300,150)];

    testPositions(Positions);
    
});

describe("delete Position", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await P_dao.deletePositionData();
        await P_dao.insertPosition(new Position(1,"800234543412","8002","3454",1000,1000,300,150));
    });
    test('delete Position', async () => {
        const idPos = 1;
        let res = await Position_service.deletePosition(idPos);
        res = await Position_service.getPositionByID(idPos);
        expect(res).toBeNull();

    });
});