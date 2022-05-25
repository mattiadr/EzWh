const InternalOrder = require('../components/InternalOrder');
const Item = require('../components/Item');
const InternalOrderService = require('../services/InternalOrder_service');
const IO_dao = require('../database/InternalOrder_DAO');
const InternalOrder_service = new InternalOrderService(IO_dao);

products1 = [new Item(null,"a product",10.99,12,null), new Item(null,"another product",11.99,180,null)];
// where do I put the quantity?
products2 = [new Item(null,"a product",10.99,12,null), new Item(null,"another product",11.99,180,null)];
// where do I put the RFID? 

async function testInternalOrders(expectedInternalOrders) {
    test('get all InternalOrders', async () => {
        let res = await InternalOrder_service.getInternalOrders();
        expect(res).toEqual(expectedInternalOrders);
    });
}

async function testInternalOrdersIssued(expectedInternalOrders) {
    test('get all issued InternalOrders', async () => {
        let res = await InternalOrder_service.getInternalOrdersByState("issued");
        expect(res).toEqual(expectedInternalOrders);
    });
}

async function testInternalOrder(id, issueDate, state, customerId, products) {
    test('get InternalOrder', async () => {
        let res = await InternalOrder_service.getInternalOrderByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.issueDate).toStrictEqual(issueDate);
        expect(res.state).toStrictEqual(state);
        expect(res.customerId).toStrictEqual(customerId);
        expect(res.products).toStrictEqual(products);
    });
}

// test case definition
describe('get InternalOrders', () => {

    beforeEach(async () => {
        await IO_dao.deleteInternalOrderData(); 
        await IO_dao.insertInternalOrder(new InternalOrder.InternalOrder(1,"2021/11/29 09:33","accepted",products1,1));
        await IO_dao.insertInternalOrder(new InternalOrder.InternalOrder(2,"2021/11/30 19:33","completed",products2,1));
    });

    const InternalOrders = [new InternalOrder.InternalOrder(1,"2021/11/29 09:33","accepted",products1,1),
    new InternalOrder.InternalOrder(2,"2021/11/30 19:33","completed",products2,1)];

    testInternalOrders(InternalOrders);
    testInternalOrder(InternalOrders[0].id, InternalOrders[0].issueDate, InternalOrders[0].state, InternalOrders[0].customerId, InternalOrders[0].products);
    testInternalOrder(InternalOrders[1].id, InternalOrders[1].issueDate, InternalOrders[1].state, InternalOrders[1].customerId, InternalOrders[1].products);
    
});

// test case definition
describe('get InternalOrders Issued', () => {

    beforeEach(async () => {
        await IO_dao.deleteInternalOrderData(); 
        await IO_dao.insertInternalOrder(new InternalOrder.InternalOrder("2021/11/29 09:33","accepted",products1,1));
        await IO_dao.insertInternalOrder(new InternalOrder.InternalOrder("2021/11/30 19:33","completed",products2,1));
    });

    const InternalOrders = [new InternalOrder.InternalOrder(1,"2021/11/29 09:33","accepted",products1,1),
    new InternalOrder.InternalOrder(2,"2021/11/30 19:33","completed",products2,1)];

    testInternalOrdersIssued(InternalOrders);
    testInternalOrder(InternalOrders[0].id, InternalOrders[0].issueDate, InternalOrders[0].state, InternalOrders[0].customerId, InternalOrders[0].products);
    testInternalOrder(InternalOrders[1].id, InternalOrders[1].issueDate, InternalOrders[1].state, InternalOrders[1].customerId, InternalOrders[1].products);
    
});

describe("set InternalOrder", () => {

    beforeEach(async () => {
        await IO_dao.deleteInternalOrderData(); 
        await IO_dao.insertInternalOrder(new InternalOrder.InternalOrder("2021/11/29 09:33","accepted",products1,1));
        await IO_dao.insertInternalOrder(new InternalOrder.InternalOrder("2021/11/30 19:33","completed",products2,1));
    });

    test('new InternalOrder.InternalOrder', async () => {
        const InternalOrder1 = new InternalOrder.InternalOrder1("2021/11/29 09:33","accepted",products1,1);
        const InternalOrder2 = new InternalOrder.InternalOrder2("2021/11/30 19:33","completed",products2,1);

        let res = await InternalOrder_service.createInternalOrder(InternalOrder1.issueDate,InternalOrder1.state,InternalOrder1.customerId,InternalOrder1.products);
        expect(res.status).toEqual(201);
        res = await InternalOrder_service.getInternalOrderByID(InternalOrder1.id);
        expect(res).toEqual(InternalOrder1);

        res = await InternalOrder_service.createInternalOrder(InternalOrder2.issueDate,InternalOrder2.state,InternalOrder2.customerId,InternalOrder2.products);
        expect(res.status).toEqual(404);
        res = await InternalOrder_service.getInternalOrderByID(InternalOrder2.id);
        expect(res).toBeNull();
    });

    test('update InternalOrder', async () => {
        const InternalOrder1 = new InternalOrder.InternalOrder("2021/11/29 09:33","accepted",products1,1);
        const InternalOrder2 = new InternalOrder.InternalOrder("2021/11/30 19:33","completed",products2,2);       
        const InternalOrder3 = new InternalOrder.InternalOrder("2021/11/31 22:33","issued",[],1);
        
        let res = await InternalOrder_service.updateInternalOrder(InternalOrder1.issueDate,InternalOrder1.state,InternalOrder1.customerId,InternalOrder1.products);
        expect(res.status).toEqual(200);
        res = await InternalOrder_service.getInternalOrderByID(InternalOrder1.id);
        expect(res).toEqual(InternalOrder1);

        res = await InternalOrder_service.updateInternalOrder(InternalOrder2.issueDate,InternalOrder2.state,InternalOrder2.customerId,InternalOrder2.products);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("InternalOrder not found");
        res = await InternalOrder_service.getInternalOrderByID(InternalOrder2.id);
        expect(res).toEqual({});

        res = await InternalOrder_service.updateInternalOrder(InternalOrder3.aisleID, InternalOrder3.row, InternalOrder3.col, InternalOrder3.maxWeight, InternalOrder3.maxVolume, InternalOrder3.occupiedWeight, InternalOrder3.occupiedVolume);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
        res = await InternalOrder_service.getInternalOrderByID(InternalOrder3.id);
        expect(res).toBeNull();
    });
});

describe("delete InternalOrder", () => {
    beforeEach(async () => {
        await IO_dao.deleteInternalOrderData();
        await IO_dao.insertInternalOrder(new InternalOrder.InternalOrder("2021/11/29 09:33","accepted",products1,1));
    });
    test('delete InternalOrder', async () => {
        const idPos = 1;
        let res = await InternalOrder_service.deleteTestDescriptor(idPos);
        expect(res).toEqual(true);
        res = await InternalOrder_service.getTestDescriptorByID(idPos);
        expect(res).toBeNull();

    });
});