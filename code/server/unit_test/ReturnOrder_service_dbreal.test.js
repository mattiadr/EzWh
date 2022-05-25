const ReturnOrder = require('../components/ReturnOrder');
const RestockOrder = require('../components/RestockOrder');
const Item = require('../components/Item');
const ReturnOrderService = require('../services/ReturnOrder_service');
const returnOrder_dao = require('../database/ReturnOrder_DAO');
const restockOrder_DAO = require('../database/RestockOrder_DAO');
const DatabaseConnection = require("../database/DatabaseConnection");

const ReturnOrder_service = new ReturnOrderService(returnOrder_dao, restockOrder_DAO)

const products = [{"SKUId":12,"description":"a product","price":10.99,"RFID":"12345678901234567890123456789016"},
  {"SKUId":180,"description":"another product","price":11.99,"RFID":"12345678901234567890123456789038"}];

async function testReturnOrders(expectedReturnOrders){
  test('get all Return Orders', async () => {
    let res = await ReturnOrder_service.getReturnOrders();
    expect(res).toEqual(expectedReturnOrders);
  })
}

async function testReturnOrder(id, returnDate, restockOrderId, products){
  test('get Return Order', async () => {
    let res = await ReturnOrder_service.getReturnOrderByID(id);
    expect(res.id).toStrictEqual(id);
    expect(res.returnDate).toStrictEqual(returnDate);
    expect(res.restockOrderId).toStrictEqual(restockOrderId);
  })
}

// test case definition
describe('get Return Order', () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});
    beforeEach(async () => {
        await returnOrder_dao.deleteReturnOrderData(); 
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(1, "2021/11/29 09:33", 1,products));
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(2, "2021/11/29 09:33", 1,products));
    });

    const ReturnOrders = [new ReturnOrder(1, "2021/11/29 09:33", 1,products),
                          new ReturnOrder(2, "2021/11/29 09:33", 1,products)];

    testReturnOrders(ReturnOrders);
    testReturnOrder(ReturnOrders[0].id, ReturnOrders[0].returnDate, ReturnOrders[0].restockOrderId, ReturnOrders[0].products);
    testReturnOrder(ReturnOrders[1].id, ReturnOrders[1].returnDate, ReturnOrders[1].restockOrderId, ReturnOrders[1].products);
});

describe("delete Return Order", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});  
  beforeEach(async () => {
        await returnOrder_dao.deleteReturnOrderData();
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(1, "2021/11/29 09:33", 1,products));
    });
    test('delete Return Order', async () => {
        const id = 1;
        let res = await ReturnOrder_service.deleteReturnOrder(id);
        res = await ReturnOrder_service.getReturnOrderByID(id);
        expect(res).toBeNull();

    });
});