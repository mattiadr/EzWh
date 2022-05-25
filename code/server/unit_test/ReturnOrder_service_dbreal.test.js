const ReturnOrder = require('../components/ReturnOrder');
const RestockOrder = require('../components/RestockOrder');
const Item = require('../components/Item');
const ReturnOrderService = require('../services/ReturnOrder_service');
const returnOrder_dao = require('../database/ReturnOrder_DAO')
const restockOrder_DAO = require('../database/RestockOrder_DAO')

const ReturnOrder_service = new ReturnOrderService(returnOrder_dao, restockOrder_DAO)

products1 = [new Item(null,"a product",10.99,12,null), new Item(null,"another product",11.99,180,null)];
// where do I put the quantity?
products2 = [new Item(null,"a product",10.99,12,null), new Item(null,"another product",11.99,180,null)];
// where do I put the RFID? 

async function testReturnOrders(expectedReturnOrders){
  test('get all Return Orders', async () => {
    let res = await ReturnOrder_service.getReturnOrders();
    expect(res).toEqual(expectedReturnOrders);
  })
}

async function testReturnOrder(id, returnDate, restockOrderId, products){
  test('get Return Order', async () => {
    let res = await returnOrder_dao.getReturnOrderByID(id);
    expect(res.id).toStrictEqual(id);
    expect(res.returnDate).toStrictEqual(returnDate);
    expect(res.restockOrderId).toStrictEqual(restockOrderId);
    expect(res.products).toStrictEqual(products);
  })
}

// test case definition
describe('get Return Order', () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
});
    beforeEach(async () => {
        await returnOrder_dao.deleteReturnOrderData(); 
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(1, "2021/11/29 09:33", 1,products1));
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(2, "2021/11/29 09:33", 1,products2));
    });

    const ReturnOrders = [new ReturnOrder(1, "2021/11/29 09:33", 1,products1),
                          new ReturnOrder(2, "2021/11/29 09:33", 1,products2)];

    testReturnOrders(ReturnOrders);
    testReturnOrder(ReturnOrders[0].id, ReturnOrders[0].returnDate, ReturnOrders[0].restockOrderId, ReturnOrders[0].products);
    testReturnOrder(ReturnOrders[1].id, ReturnOrders[1].returnDate, ReturnOrders[1].restockOrderId, ReturnOrders[1].products);
});

describe("set Return Order", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
});
    beforeEach(async () => {
        await returnOrder_dao.deleteReturnOrderData(); 
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(1, "2021/11/29 09:33", 1,products1));
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(2, "2021/11/29 09:33", 1,products2));
    });

    test('new Return Order', async () => {
        const ReturnOrder1 = new ReturnOrder(1, "2021/11/29 09:33", 1,products1);
        const ReturnOrder2 = new ReturnOrder(4, "2021/11/29 09:33", 1,products2);

        let res = await ReturnOrder_service.newReturnOrder(ReturnOrder1.returnDate, ReturnOrder1.products, ReturnOrder1.restockOrderId);
        expect(res.status).toEqual(201);
        res = await ReturnOrder_service.getReturnOrderByID(ReturnOrder1.id);
        expect(res).toEqual(ReturnOrder1);

        res = await ReturnOrder_service.newReturnOrder(ReturnOrder2.returnDate, ReturnOrder2.products, ReturnOrder2.restockOrderId);
        expect(res.status).toEqual(404);
        res = await ReturnOrder_service.getInternalOrderByID(ReturnOrder2.id);
        expect(res).toBeNull();
    });
});

describe("delete Return Order", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
});  
  beforeEach(async () => {
        await returnOrder_dao.deleteReturnOrderData();
        await returnOrder_dao.insertReturnOrder(new ReturnOrder(1, "2021/11/29 09:33", 1,products1));
    });
    test('delete Return Order', async () => {
        const id = 1;
        let res = await ReturnOrder_service.deleteReturnOrder(id);
        res = await ReturnOrder_service.getReturnOrderByID(id);
        expect(res).toBeNull();

    });
});