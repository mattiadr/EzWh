const Position = require('../components/Position');
const PositionService = require('../services/Position_service');
const testP_dao = require('../mock_database/mock_Position_dao');
const Position_service = new PositionService(testP_dao);

// test case definition
describe('get testPositions', () => {

    beforeEach(() => {
        testD_dao.selectPositions.mockReset();
        testD_dao.selectTestPositionByID.mockReset();

        testD_dao.selectTestPositions.mockReturnValue(
            [ new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8),
            new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6)
            ]);
        testD_dao.selectPositionByID.mockReturnValueOnce(
            new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8)
            ).mockReturnValueOnce(
                new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6)
            );
    });

    test('get all Positions', async () => {
        const Positions = [ new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8),
        new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6)];
        let res = await Position_service.getPositions();
        expect(res).toEqual(Positions);
    });

    test('get Position By ID', async () => {
        res = await Position_service.getPositionByID(1);
        expect(res).toEqual(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8));

        res = await Position_service.getPositionByID(2);
        expect(res).toEqual(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
        
        res = await Position_service.getPositionByID(3);
        expect(res).toBe(undefined);
    });

});

describe("set Position", () => {
    beforeEach(() => {
        testP_dao.selectPositionByID.mockReset();
        sku_dao.selectPositionByID.mockReturnValueOnce(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8))
        .mockReturnValueOnce(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    })
    test('new Position', async () => {
        const Test1 = new Position(null, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
        const Test2 = new Position(null, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);

        let res = await Position_service.createPosition(Test1.aisleID, Test1.row, Test1.col, Test1.maxWeight, Test1.maxVolume, Test1.occupiedWeight, Test1.occupiedVolume);

        expect(sku_dao.selectPositionByID.mock.calls[0][0]).toBe(Test1.positionID);
        expect(testPdao.insertPosition.mock.calls[0][0]).toStrictEqual(Test1);
        expect(res.status).toEqual(201);

        res = await Position_service.createPosition(Test2.aisleID, Test2.row, Test2.col, Test2.maxWeight, Test2.maxVolume, Test2.occupiedWeight, Test2.occupiedVolume);
        expect(sku_dao.selectPositionByID.mock.calls[1][0]).toBe(Test2.positionID);
        expect(res.status).toEqual(201);
    });

    test('update Position', async () => {
        const Test1 = new Position(null, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
        const Test2 = new Position(null, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);        

        let res = await Position_service.updatePosition(Test1.aisleID, Test1.row, Test1.col, Test1.maxWeight, Test1.maxVolume, Test1.occupiedWeight, Test1.occupiedVolume);
        expect(testP_dao.selectPositionByID.mock.calls[0][0]).toBe(Test1.positionID);
        expect(testP_dao.updatePosition.mock.calls[0][0]).toStrictEqual(Test1);
        expect(res.status).toEqual(200);
        
        res = await Position_service.updatePosition(Test2.aisleID, Test2.row, Test2.col, Test2.maxWeight, Test2.maxVolume, Test2.occupiedWeight, Test2.occupiedVolume);
        expect(testP_dao.selectPositionByID.mock.calls[0][0]).toBe(Test2.positionID);
        expect(testP_dao.updatePosition.mock.calls[0][0]).toStrictEqual(Test2);
        expect(res.status).toEqual(200);

    });

});

describe("delete Position", () => {
    beforeEach(() => {
        testP_dao.deletePosition.mockReset();
        testP_dao.deletePosition.mockReturnValueOnce(true);
    })
    test('delete Position', async () => {
        const idPos = 1;
        let res = await Position_service.deletePosition(idPos);

        expect(testP_dao.deletePosition.mock.calls[0][0]).toBe(idPos);
        expect(res).toEqual(true);
    });
});
