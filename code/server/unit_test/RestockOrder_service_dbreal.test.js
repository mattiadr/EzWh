const RestockOrder = require('../components/RestockOrder');
const RestockOrderService = require('../services/RestockOrder_service');
const RKO_dao = require('../database/RestockOrder_DAO');
const RestockOrder_service = new RestockOrderService(RKO_dao);

async function testRestockOrders(expectedRestockOrders) {
    test('get all RestockOrders', async () => {
        let res = await RestockOrder_service.getRestockOrders();
        expect(res).toEqual(expectedRestockOrders);
    });
}

async function testRestockOrdersIssued(expectedRestockOrders) {
    test('get all RestockOrders', async () => {
        let res = await RestockOrder_service.getRestockOrdersByState("issued");
        expect(res).toEqual(expectedRestockOrders);
    });
}

// how should I treat the Id? 

async function testRestockOrder(id, issueDate, state, supplierId) {
    test('get RestockOrder', async () => {
        let res = await RestockOrder_service.getRestockOrderByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.issueDate).toStrictEqual(issueDate);
        expect(res.state).toStrictEqual(state);
        expect(res.supplierId).toStrictEqual(supplierId);
    });
}

// test case definition
describe('get RestockOrders', () => {

    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
        await RKO_dao.insertRestockOrder(new RestockOrder(null,"2021/11/21 10:33","issued",2,null,null));
    });

    const RestockOrders = [new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null),
    new RestockOrder(null,"2021/11/21 10:33","issued",2,null,null)];

    testRestockOrders(RestockOrders);
    testRestockOrder(RestockOrders[0].id, RestockOrders[0].issueDate, RestockOrders[0].state, RestockOrders[0].supplierId);
    testRestockOrder(RestockOrders[1].id, RestockOrders[1].issueDate, RestockOrders[1].state, RestockOrders[1].supplierId);
    
});

describe('get RestockOrders Issued', () => {

    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
        await RKO_dao.insertRestockOrder(new RestockOrder(null,"2021/11/21 10:33","issued",2,null,null));
    });

    const RestockOrders = [new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null),
    new RestockOrder(null,"2021/11/21 10:33","issued",2,null,null)];

    testRestockOrdersIssued(RestockOrders);
    testRestockOrder(RestockOrders[0].id, RestockOrders[0].issueDate, RestockOrders[0].state, RestockOrders[0].supplierId);
    testRestockOrder(RestockOrders[1].id, RestockOrders[1].issueDate, RestockOrders[1].state, RestockOrders[1].supplierId);
    
});

describe("set RestockOrder", () => {

    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
        await RKO_dao.insertRestockOrder(new RestockOrder(null,"2021/11/21 10:33","issued",2,null,null));
    });

    test('new RestockOrder', async () => {
        const RestockOrder1 = new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null);
        const RestockOrder2 = new RestockOrder(null,"2021/11/21 10:33","issued",2,null,null);

        let res = await RestockOrder_service.createRestockOrder(RestockOrder1.description,RestockOrder1.price,RestockOrder1.SKUID,RestockOrder1.supplierId);
        expect(res.status).toEqual(201);
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder1.id);
        expect(res).toEqual(RestockOrder1);

        res = await RestockOrder_service.createRestockOrder(RestockOrder2.description,RestockOrder2.price,RestockOrder2.SKUID,RestockOrder2.supplierId);
        expect(res.status).toEqual(404);
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder2.id);
        expect(res).toBeNull();
    });

    test('update RestockOrder', async () => {
        const RestockOrder1 = new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null);
        const RestockOrder2 = new RestockOrder(null,"2021/11/21 10:33","issued",2,null,null);       
        const RestockOrder3 = new RestockOrder(null,"2021/11/22 11:33","issued",3,null,null);
        
        let res = await RestockOrder_service.updateRestockOrder(RestockOrder1.description,RestockOrder1.price,RestockOrder1.SKUID,RestockOrder1.supplierId);
        expect(res.status).toEqual(200);
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder1.id);
        expect(res).toEqual(RestockOrder1);

        res = await RestockOrder_service.updateRestockOrder(RestockOrder2.description,RestockOrder2.price,RestockOrder2.SKUID,RestockOrder2.supplierId);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("RestockOrder not found");
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder2.id);
        expect(res).toEqual({});

        res = await RestockOrder_service.updateRestockOrder(RestockOrder3.aisleID, RestockOrder3.row, RestockOrder3.col, RestockOrder3.maxWeight, RestockOrder3.maxVolume, RestockOrder3.occupiedWeight, RestockOrder3.occupiedVolume);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder3.id);
        expect(res).toBeNull();
    });
});

describe("delete RestockOrder", () => {
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData();
        await RKO_dao.insertRestockOrder(new RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
    });
    test('delete RestockOrder', async () => {
        const idPos = 1;
        let res = await RestockOrder_service.deleteTestDescriptor(idPos);
        expect(res).toEqual(true);
        res = await RestockOrder_service.getTestDescriptorByID(idPos);
        expect(res).toBeNull();

    });
});