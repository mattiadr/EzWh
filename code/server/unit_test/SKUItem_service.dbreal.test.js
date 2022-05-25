const SKUItem = require('../components/SKUItem');
const SKU = require('../components/SKU')
const SKUItemService = require('../services/SKUItem_service');
const skuItem_dao = require('../database/SKUItem_DAO');
const sku_dao = require('../database/SKU_DAO');
const SKUItem_service = new SKUItemService(skuItem_dao, sku_dao);
const DatabaseConnection = require("../database/DatabaseConnection");

async function testSKUItems(expectedSKUItems){
  test('get all SKU Item', async () => {
    let res = await SKUItem_service.getSKUItems();
    expect(res).toEqual(expectedSKUItems);
  })
}

async function testSKUItem(RFID, SKUID, available, dateOfStock){
  test('get SKU Item', async () => {
    let res = await SKUItem_service.getSKUItemByRFID(RFID);
    expect(res.RFID).toStrictEqual(RFID);
    expect(res.SKUID).toStrictEqual(SKUID);
    expect(res.available).toStrictEqual(available);
    expect(res.dateOfStock).toStrictEqual(dateOfStock);
  })
}

// test case definition
describe("get SKU Items", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});
  beforeEach(async () => {
    await skuItem_dao.deleteSKUItemData();
    await skuItem_dao.insertSKUItem(new SKUItem("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"));
    await skuItem_dao.insertSKUItem(new SKUItem("12345678901234567890123456789015", 2, 1, "2021/11/30 12:31"));
  });

  const SKUItems = [new SKUItem("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"), 
                  new SKUItem("12345678901234567890123456789015", 2, 1, "2021/11/30 12:31")]

  testSKUItems(SKUItems);
  testSKUItem(SKUItems[0].RFID, SKUItems[0].SKUID, SKUItems[0].available, SKUItems[0].dateOfStock);
  testSKUItem(SKUItems[1].RFID, SKUItems[1].SKUID, SKUItems[1].available, SKUItems[1].dateOfStock);
})

describe("set SKU Items", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});
  beforeEach(async () => {
    await skuItem_dao.deleteSKUItemData();
    await sku_dao.deleteSKUData()
    await skuItem_dao.insertSKUItem(new SKUItem("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"));
    await skuItem_dao.insertSKUItem(new SKUItem("12345678901234567890123456789015", 2, 1, "2021/11/30 12:31"));
    await sku_dao.insertSKU(new SKU (1, "first sku", 60, 20, 10.99, "notes: ...", 50, "800234543412"));
  });

  test('new SKU Item', async () => {
    const SKUItem3 = new SKUItem("12345678901234567890123456789016", 1, 2, "2021/12/29 12:32")
    const SKUItem4 = new SKUItem("12345678901234567890123456789017", 4, 3, "2021/12/30 12:33")

    let res = await SKUItem_service.createSKUItem(SKUItem3.RFID, SKUItem3.SKUID, SKUItem3.available, SKUItem3.dateOfStock);
    expect(res.status).toEqual(201);
    res = await SKUItem_service.getSKUItemsBySKUID(SKUItem3.SKUID)
    expect(res).toEqual(SKUItem3)

    res = await SKUItem_service.createSKUItem(SKUItem4.RFID, SKUItem4.SKUID, SKUItem4.available, SKUItem4.dateOfStock);
    expect(res.status).toEqual(404);
    res = await SKUItem_service.getSKUItemsBySKUID(SKUItem4.SKUID)
    expect(res).toBeNull()
  })

  test('update SKU Item', async () => {
    const SKUItem1 = new SKUItem("12345678901234567890123456789024", 1, 2, "2021/11/29 12:30")
    const SKUItem2 = new SKUItem("12345678901234567890123456789025", 2, 2, "2021/11/29 12:30")
    const SKUItem5 = new SKUItem("12345678901234567890123456789066", 1, 3, "2021/11/29 12:30")

    let res = await SKUItem_service.updateSKUItem(SKUItem1.RFID, SKUItem1.SKUID, SKUItem1.available, SKUItem1.dateOfStock)
    expect(res.status).toEqual(200);
    res = await SKUItem_service.getSKUItemsBySKUID(SKU1.SKUID);
    expect(res).toEqual(SKUItem1)
    
    res = await SKUItem_service.updateSKUItem(SKUItem2.RFID, SKUItem2.SKUID, SKUItem2.available, SKUItem2.dateOfStock)
    expect(res.status).toEqual(404);
    expect(res.body).toEqual("SKU Item not found")
    res = await SKUItem_service.getSKUItemsBySKUID(SKU2.SKUID);
    expect(res).toEqual({})

    res = await SKUItem_service.updateSKUItem(SKUItem5.RFID, SKUItem5.SKUID, SKUItem5.available, SKUItem5.dateOfStock)
    expect(res.status).toEqual(404);
    expect(res.body).toEqual("ID not found")
    res = await SKUItem_service.getSKUItemsBySKUID(SKU5.SKUID);
    expect(res).toEqual()
  })
})

describe("delete SKU Item", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});
  beforeEach(async () => {
    await skuItem_dao.deleteSKUItemData();
    await skuItem_dao.insertSKUItem(new SKUItem("12345678901234567890123456789016", 1, 2, "2021/12/29 12:32"));
  });
  test('delete SKU', async () => {
    const RFID = "12345678901234567890123456789016";
    let res = await SKUItem_service.deleteSKUItem(RFID);
    res = await SKUItem_service.getSKUItemByRFID(RFID);
    expect(res).toBeNull();
  });
})