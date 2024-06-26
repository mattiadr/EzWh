const Item = require('../components/Item');
const ItemService = require('../services/Item_service');
const I_dao = require('../database/Item_DAO');
const Item_service = new ItemService(I_dao);
const DatabaseConnection = require("../database/DatabaseConnection");

async function testItems(expectedItems) {
    test('get all Items', async () => {
        let res = await Item_service.getItems();
        expect(res).toEqual(expectedItems);
    });
}

async function testItem(id, description, price, SKUID, supplierId) {
    test('get Item', async () => {
        let res = await Item_service.getItemByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.description).toStrictEqual(description);
        expect(res.price).toStrictEqual(price);
        expect(res.SKUID).toStrictEqual(SKUID);
        expect(res.supplierId).toStrictEqual(supplierId);
    });
}

// test case definition
describe('get Items', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await I_dao.deleteItemData(); 
        await I_dao.insertItem(new Item(1,"a new item",10.99,1,2));
        await I_dao.insertItem(new Item(2,"another item",12.99,2,1));
    });

    const Items = [new Item(1,"a new item",10.99,1,2),
    new Item(2,"another item",12.99,2,1)];

    testItems(Items);
    testItem(Items[0].id, Items[0].description, Items[0].price, Items[0].SKUID, Items[0].supplierId);
    testItem(Items[1].id, Items[1].description, Items[1].price, Items[1].SKUID, Items[1].supplierId);
    
});

describe("set Item", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await I_dao.deleteItemData(); 
        await I_dao.insertItem(new Item(1,"a new item",10.99,1,2));
        await I_dao.insertItem(new Item(2,"another item",12.99,2,1));
    });

    test('update Item', async () => {
        const Item1 = new Item(1,"a new item",10.99,1,2);
        const Item2 = new Item(2,"another item",12.99,2,2);       
        const Item3 = new Item(3,"yet another item",15.99,3,5);
        
        let res = await Item_service.updateItem(Item1.id,Item1.description,Item1.price,Item1.SKUID,Item1.supplierId);
        expect(res.status).toEqual(200);
        res = await Item_service.getItemByID(Item1.id);
        expect(res).toEqual(Item1);

        res = await Item_service.updateItem(Item2.id,Item2.description,Item2.price,Item2.SKUID,Item2.supplierId);
        expect(res.status).toEqual(200)
        res = await Item_service.getItemByID(Item2.id);
        expect(res).toEqual(Item2);

        res = await Item_service.updateItem(Item3.id,Item3.aisleID, Item3.row, Item3.col, Item3.maxWeight, Item3.maxVolume, Item3.occupiedWeight, Item3.occupiedVolume);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("item not found");
        res = await Item_service.getItemByID(Item3.id);
        expect(res).toBeNull();
    });
});

describe("delete Item", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await I_dao.deleteItemData();
        await I_dao.insertItem(new Item(1,"a new item",10.99,1,2));
    });
    test('delete Item', async () => {
        const idItem = 1;
        let res = await Item_service.deleteItem(idItem);
        res = await Item_service.getItemByID(idItem);
        expect(res).toBeNull();

    });
});