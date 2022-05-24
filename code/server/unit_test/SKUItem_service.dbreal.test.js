const SKUItem = require('../components/SKUItem');
const SKUItemService = require('../services/SKUItem_service');

const skuItem_dao = require('../database/SKUItem_DAO')
const sku_dao = require('../database/SKU_DAO')

const SKUItem_service = new SKUItemService(skuItem_dao, sku_dao)

async function testSKUItems(expectedSKUItems){
  test('get all SKU Item', async () => {
    let res = await skuItem_dao.selectSKUItems();
    expect(res).toEqual(expectedSKUItems);
  })
}

async function testSKUItem(RFID, SKUID, available, dateOfStock){
  test('get SKU Item', async () => {
    let res = await sku_dao.selectSKUbyID(RFID);
    expect(res.RFID).toStrictEqual(RFID);
    expect(res.SKUID).toStrictEqual(SKUID);
    expect(res.available).toStrictEqual(available);
    expect(res.dateOfStock).toStrictEqual(dateOfStock);
  })
}

// test case definition
describe("get SKU Items", () => {
  beforeEach(async () => {
    await skuItems_dao.deleteSKUItem();
    await skuItems_dao.insertSKU(new SKUItem("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"));
    await skuItems_dao.insertSKU(new SKUItem("12345678901234567890123456789015", 2, 1, "2021/11/30 12:31"));
  });

  const SKUItems = [new SKUItem("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"), 
                  new SKUItem("12345678901234567890123456789015", 2, 1, "2021/11/30 12:31")]

  testSKUItems(SKUItems);
  testSKUItem(SKUItems[0].RFID, SKUItems[0].SKUID, SKUItems[0].available, SKUItems[0].dateOfStock);
  testSKUItem(SKUItems[1].RFID, SKUItems[1].SKUID, SKUItems[1].available, SKUItems[1].dateOfStock);
})

describe("set SKU Items", () => {
  beforeEach(async () => {
    await skuItems_dao.deleteSKUItem();
    await skuItems_dao.insertSKU(new SKUItem("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"));
    await skuItems_dao.insertSKU(new SKUItem("12345678901234567890123456789015", 2, 1, "2021/11/30 12:31"));
  });

  test('new SKU Item', async () => {
    const SKUItem3 = new SKUItem("12345678901234567890123456789016", 3, 2, "2021/12/29 12:32")
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
    const SKUItem1 = new new SKUItem("12345678901234567890123456789024", 4, 1, "2021/11/29 12:30")
    const SKUItem2 = new new SKUItem("12345678901234567890123456789025", 5, 2, "2021/11/29 12:30")
    const SKUItem5 = new new SKUItem("12345678901234567890123456789066", 6, 3, "2021/11/29 12:30")

    let res = await SKU_service.updateSKU(SKUItem1.RFID, SKUItem1.SKUID, SKUItem1.available, SKUItem1.dateOfStock)
    expect(res.status).toEqual(200);
    res = await SKU_service.getSKUItemsBySKUID(SKU1.SKUID);
    expect(res).toEqual(SKUItem1)
    
    res = await SKU_service.updateSKU(SKUItem2.RFID, SKUItem2.SKUID, SKUItem2.available, SKUItem2.dateOfStock)
    expect(res.status).toEqual(404);
    expect(res.body).toEqual("SKU Item not found")
    res = await SKU_service.getSKUItemsBySKUID(SKU2.SKUID);
    expect(res).toEqual({})

    res = await SKU_service.updateSKU(SKUItem5.RFID, SKUItem5.SKUID, SKUItem5.available, SKUItem5.dateOfStock)
    expect(res.status).toEqual(404);
    expect(res.body).toEqual("SKU Item not found")
    res = await SKU_service.getSKUItemsBySKUID(SKU5.SKUID);
    expect(res).toEqual()
  })
})

describe("delete SKU Item", () => {
  beforeEach(async () => {
    await skuItem_dao.deleteSKUItemData();
    await skuItem_dao.insertSKUItem(new SKUItem("12345678901234567890123456789016", 1, 2, "2021/12/29 12:32"));
  });
  test('delete SKU', async () => {
    const SKUID = 1;
    let res = await SKU_service.deleteSKU(SKUID);
    expect(res).toEqual(true);
    res = await SKU_service.getSKUbyId(SKUID);
    expect(res).toBeNull();
  });
})