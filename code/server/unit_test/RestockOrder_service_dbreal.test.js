const RestockOrder = require('../components/RestockOrder');
const skuItem = require('../components/SKUItem');
const RestockOrderService = require('../services/RestockOrder_service');
const RKO_dao = require('../database/RestockOrder_DAO');
const RestockOrder_service = new RestockOrderService(RKO_dao);
const DatabaseConnection = require("../database/DatabaseConnection");

async function testRestockOrders(expectedRestockOrders) {
    test('get all RestockOrders', async () => {
        let res = await RestockOrder_service.getRestockOrders();
        expect(res).toEqual(expectedRestockOrders);
    });
}

async function testRestockOrdersIssued(expectedRestockOrders) {
    test('get all issued RestockOrders', async () => {
        let res = await RestockOrder_service.getRestockOrdersByState("issued");
        expect(res).toEqual(expectedRestockOrders);
    });
}

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
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
    });
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,null));
    });

    const RestockOrders = [new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null),
    new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,null)];

    testRestockOrders(RestockOrders);
    testRestockOrder(RestockOrders[0].id, RestockOrders[0].issueDate, RestockOrders[0].state, RestockOrders[0].supplierId);
    testRestockOrder(RestockOrders[1].id, RestockOrders[1].issueDate, RestockOrders[1].state, RestockOrders[1].supplierId);
    
});

describe('get RestockOrders Issued', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
    });
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,null));
    });

    const RestockOrders = [new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null),
    new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,null)];

    testRestockOrdersIssued(RestockOrders);
    testRestockOrder(RestockOrders[0].id, RestockOrders[0].issueDate, RestockOrders[0].state, RestockOrders[0].supplierId);
    testRestockOrder(RestockOrders[1].id, RestockOrders[1].issueDate, RestockOrders[1].state, RestockOrders[1].supplierId);
    
});

describe("set RestockOrder", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
    });
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,null));
    });

    test('new RestockOrder.RestockOrder', async () => {
        const RestockOrder1 = new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null);
        const RestockOrder2 = new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,null);

        let res = await RestockOrder_service.createRestockOrder(RestockOrder1.issueDate,RestockOrder1.state,RestockOrder1.supplierId);
        expect(res.status).toEqual(201);
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder1.id);
        expect(res).toEqual(RestockOrder1);

        res = await RestockOrder_service.createRestockOrder(RestockOrder2.issueDate,RestockOrder2.state,RestockOrder2.supplierId);
        expect(res.status).toEqual(404);
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder2.id);
        expect(res).toBeNull();
    });

    test('update RestockOrder state', async () => { 
        const RestockOrder1 = new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null);
        const RestockOrder2 = new RestockOrder.RestockOrder(null,"2021/11/21 10:33","delivered",2,null,null);       
        const RestockOrder3 = new RestockOrder.RestockOrder(null,"2021/11/22 11:33","issued",3,null,null);
        
        let res = await RestockOrder_service.updateRestockOrder(RestockOrder1.issueDate,RestockOrder1.state,RestockOrder1.supplierId);
        expect(res.status).toEqual(200);
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder1.id);
        expect(res).toEqual(RestockOrder1);

        res = await RestockOrder_service.updateRestockOrderState(RestockOrder2.id,RestockOrder2.state);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("RestockOrder not found");
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder2.id);
        expect(res).toEqual({});

        res = await RestockOrder_service.updateRestockOrder(RestockOrder3.issueDate,RestockOrder3.state,RestockOrder3.supplierId);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder3.id);
        expect(res).toBeNull();
    });

    test('update RestockOrder transport note', async () => { 
        const RestockOrder1 = new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,"2021/11/20 09:33",null);
        
        let res = await RestockOrder_service.updateRestockOrderTransportNote(RestockOrder1.id, RestockOrder.deliveryDate);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("RestockOrder not found");
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder2.id);
        expect(res).toEqual({});

    });

    test('update RestockOrder SKUItems', async () => { 
        const RestockOrder1 = new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,"2021/11/20 09:33",null);
        
        skuItems = [new SKUItem("12345678901234567890123456789016",12,null,null), new SKUItem("12345678901234567890123456789017",12,null,null)];
    
        let res = await RestockOrder_service.addSkuItemsToRestockOrder(RestockOrder1.id, skuItems);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("RestockOrder not found");
        res = await RestockOrder_service.getRestockOrderByID(RestockOrder2.id);
        expect(res).toEqual({});

    });

});

describe("delete RestockOrder", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
    });
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData();
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,null));
    });
    test('delete RestockOrder', async () => {
        const idPos = 1;
        let res = await RestockOrder_service.deleteTestDescriptor(idPos);
        res = await RestockOrder_service.getTestDescriptorByID(idPos);
        expect(res).toBeNull();

    });
});