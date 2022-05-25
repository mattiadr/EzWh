const SKU = require('../components/SKU');
const SKUService = require('../services/SKU_service');
const sku_dao = require('../database/SKU_DAO');
const testD_dao = require('../database/TestDescriptor_DAO');
const postion_dao = require('../database/Position_DAO');
const DatabaseConnection = require("../database/DatabaseConnection");
const SKU_service = new SKUService(sku_dao, testD_dao, postion_dao);

async function testSKUs(expectedSKUs){
  test('get all SKUs', async () => {
    let res = await sku_dao.selectSKUs();
    expect(res).toEqual(expectedSKUs);
  })
}

async function testSKU(id, description, weight, volume, price, notes, positionId, availableQuantity){
  test('get SKU', async () => {
    let res = await SKU_service.getSKUbyId(id);
    expect(res.id).toStrictEqual(id);
    expect(res.description).toStrictEqual(description);
    expect(res.weight).toStrictEqual(weight);
    expect(res.volume).toStrictEqual(volume);
    expect(res.price).toStrictEqual(price);
    expect(res.notes).toStrictEqual(notes);
    expect(res.positionId).toStrictEqual(positionId);
    expect(res.availableQuantity).toStrictEqual(availableQuantity);
  })
}

// test case definition
describe("get SKUs", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});
  beforeEach(async () => {
    await sku_dao.deleteSKUData();
    await sku_dao.insertSKU(new SKU(1, "sku1", 100, 50, 10.99, "first SKU", 50, "800234523412"));
    await sku_dao.insertSKU(new SKU(2, "sku2", 101, 51, 11.99, "second SKU", 51, "800234523413"));
  });

  const SKUs = [new SKU(1, "sku1", 100, 50, 10.99, "first SKU", 50, "800234523412"), 
                new SKU(2, "sku2", 101, 51, 11.99, "second SKU", 51, "800234523413")]

  testSKUs(SKUs);
  testSKU(SKUs[0].id, SKUs[0].description, SKUs[0].weight, SKUs[0].volume, SKUs[0].price, SKUs[0].notes,  SKUs[0].positionId, SKUs[0].availableQuantity);
  testSKU(SKUs[1].id, SKUs[1].description, SKUs[1].weight, SKUs[1].volume, SKUs[1].price, SKUs[1].notes,  SKUs[1].positionId, SKUs[1].availableQuantity);
})

describe("set SKUs", () => {
  beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});
  beforeEach(async () => {
    await sku_dao.deleteSKUData();
    await sku_dao.insertSKU(new SKU(1, "sku1", 100, 50, 10.99, "first SKU", 50, "800234523412"));
    await sku_dao.insertSKU(new SKU(2, "sku2", 101, 51, 11.99, "second SKU", 51, "800234523413"));
  });

  test('new SKU', async () => {
    const SKU3 = new SKU(3, "sku3", 102, 52, 12.99, "third SKU", 52, "800234523414")
    const SKU4 = new SKU(4, "sku4", 103, 53, 13.99, "fourth SKU", 53, "800234523415")

    let res = await SKU_service.createSKU(SKU3.id,SKU3.description, SKU3.weight, SKU3.volume, SKU3.notes, SKU3.price, SKU3.availableQuantity);
    expect(res.status).toEqual(201);
    res = await SKU_service.getSKUbyId(SKU3.id)
    expect(res).toEqual(SKU3)

    res = await SKU_service.createSKU(SKU4.id,SKU4.description, SKU4.weight, SKU4.volume, SKU4.notes, SKU4.price, SKU4.availableQuantity);
    expect(res.status).toEqual(404);
    res = await SKU_service.getSKUbyId(SKU4.id)
    expect(res).toBeNull()
  })

  test('update SKU', async () => {
    const SKU1 = new SKU(1, '(updated) sku1', 99, 49, 9.99, 'updated first sku', 49, '800234523411')
    const SKU2 = new SKU(2, '(updated) sku1', 100, 50, 10.99, 'updated second sku', 50, '800234523412')
    const SKU5 = new SKU(5, '(updated) sku5', 100, 50, 10.99, 'updated second sku', 50, '800234523412')

    let res = await SKU_service.updateSKU(SKU1.id, SKU1.positionId, SKU1.description, SKU1.weight, SKU1.volume, SKU1.notes, SKU1.price, SKU1.availableQuantity)
    expect(res.status).toEqual(200);
    res = await SKU_service.getSKUbyId(SKU1.id);
    expect(res).toEqual(SKU1)
    
    res = await SKU_service.updateSKU(SKU2.id, SKU2.positionId, SKU2.description, SKU2.weight, SKU2.volume, SKU2.notes, SKU2.price, SKU2.availableQuantity)
    expect(res.status).toEqual(404);
    expect(res.body).toEqual("SKU not found")
    res = await SKU_service.getSKUbyId(SKU2.id);
    expect(res).toEqual({})

    res = await SKU_service.updateSKU(SKU5.id, SKU5.positionId, SKU5.description, SKU5.weight, SKU5.volume, SKU5.notes, SKU5.price, SKU5.availableQuantity)
    expect(res.status).toEqual(404);
    expect(res.body).toEqual("SKU not found")
    res = await SKU_service.getSKUbyId(SKU5.id);
    expect(res).toEqual()
  })
})

describe("delete SKU", () => {
beforeAll(async () => {
    await DatabaseConnection.createConnection();
    await DatabaseConnection.resetAllTables();
    await DatabaseConnection.createDefaultUsers();
});
  beforeEach(async () => {
    await sku_dao.deleteSKUData();
    await sku_dao.insertSKU(new SKU(1, "sku1", 100, 50, 10.99, "first SKU", 50, "800234523412"));
  });
  test('delete SKU', async () => {
    const idSKU = 1;
    let res = await SKU_service.deleteSKU(idSKU);
    res = await SKU_service.getSKUbyId(idSKU);
    expect(res).toBeNull();

  });
})