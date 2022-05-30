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