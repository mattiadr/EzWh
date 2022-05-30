const RestockOrder = require('../components/RestockOrder');
const skuItem = require('../components/SKUItem');
const RestockOrderService = require('../services/RestockOrder_service');
const RKO_dao = require('../database/RestockOrder_DAO');
const RestockOrder_service = new RestockOrderService(RKO_dao);
const DatabaseConnection = require("../database/DatabaseConnection");

const products = [{"SKUId":12,"description":"a product","price":10.99,"qty":30},
    {"SKUId":180,"description":"another product","price":11.99,"qty":20}];

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
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,products));
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,products));
    });

    const RestockOrders = [new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,products),
    new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,products)];

    testRestockOrders(RestockOrders);
    
});

describe('get RestockOrders Issued', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData(); 
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,products));
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,products));
    });

    const RestockOrders = [new RestockOrder.RestockOrder(null,"2021/11/20 09:33","issued",1,null,products),
    new RestockOrder.RestockOrder(null,"2021/11/21 10:33","issued",2,null,products)];

    testRestockOrdersIssued(RestockOrders);
    
});

describe("delete RestockOrder", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await RKO_dao.deleteRestockOrderData();
        await RKO_dao.insertRestockOrder(new RestockOrder.RestockOrder(1,"2021/11/20 09:33","issued",1,null,products));
    });
    test('delete RestockOrder', async () => {
        const idRKO = 1;
        let res = await RestockOrder_service.deleteRestockOrder(idRKO);
        res = await RestockOrder_service.getRestockOrderByID(idRKO);
        expect(res).toBeNull();

    });
});