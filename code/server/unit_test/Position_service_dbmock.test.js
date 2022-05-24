const Position = require('../components/Position');
const PositionService = require('../services/Position_service');
const P_dao = require('../mock_database/mock_Position_dao');
const Position_service = new PositionService(P_dao);

// test case definition
describe('get Positions', () => {

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
        P_dao.selectPositionByID.mockReset();
        sku_dao.selectPositionByID.mockReturnValueOnce(new Position(1, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8))
        .mockReturnValueOnce(new Position(2, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6));
    })
    test('new Position', async () => {
        const Pos1 = new Position(null, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
        const Pos2 = new Position(null, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);

        let res = await Position_service.createPosition(Pos1.aisleID, Pos1.row, Pos1.col, Pos1.maxWeight, Pos1.maxVolume, Pos1.occupiedWeight, Pos1.occupiedVolume);

        expect(P_dao.insertPosition.mock.calls[0][0]).toStrictEqual(Pos1);
        expect(res.status).toEqual(201);

        res = await TestDescriptor_service.createPosition(Pos2.aisleID, Pos2.row, Pos2.col, Pos2.maxWeight, Pos2.maxVolume, Pos2.occupiedWeight, Pos2.occupiedVolume);
        expect(sku_dao.selectPositionByID.mock.calls[1][0]).toBe(Pos1.positionID);
        expect(res.status).toEqual(404);
    });

    test('update Position', async () => {
        const Pos1 = new Position(null, "AID01670", "K102", "G560", 800, 60, 560.50, 40.8);
        const Pos2 = new Position(null, "AID01990", "D108", "Z300", 800, 60, 430.50, 52.6);        

        let res = await Position_service.updatePosition(Pos1.aisleID, Pos1.row, Pos1.col, Pos1.maxWeight, Pos1.maxVolume, Pos1.occupiedWeight, Pos1.occupiedVolume);
        expect(P_dao.selectPositionByID.mock.calls[0][0]).toBe(Pos1.positionID);
        expect(P_dao.updatePosition.mock.calls[0][0]).toStrictEqual(Pos1);
        expect(res.status).toEqual(200);
        
        res = await Position_service.updatePosition(Pos2.aisleID, Pos2.row, Pos2.col, Pos2.maxWeight, Pos2.maxVolume, Pos2.occupiedWeight, Pos2.occupiedVolume);
        expect(P_dao.selectPositionByID.mock.calls[0][0]).toBe(Pos2.positionID);
        expect(P_dao.updatePosition.mock.calls[0][0]).toStrictEqual(Pos1);
        expect(res.status).toEqual(404);

    });

});

describe("delete Position", () => {
    beforeEach(() => {
        P_dao.deletePosition.mockReset();
        P_dao.deletePosition.mockReturnValueOnce(true);
    })
    test('delete Position', async () => {
        const idPos = 1;
        let res = await Position_service.deletePosition(idPos);

        expect(P_dao.deletePosition.mock.calls[0][0]).toBe(idPos);
        expect(res).toEqual(true);
    });
});
