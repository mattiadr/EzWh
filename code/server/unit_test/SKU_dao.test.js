const sku_dao = require('../database/SKU_DAO');
const SKU = require('../components/SKU')

async function testSKUs(expectedSKUs){
  test('get all SKUs', async () => {
    let res = await sku_dao.selectSKUs();
    expect(res).toEqual(expectedSKUs);
  })
}

async function testSKU(id, description, weight, volume, price, notes, positionId, availableQuantity){
  test('get SKU', async () => {
    let res = await sku_dao.selectSKUbyID(id);
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

async function testNewSKU(id, description, weight, volume, price, notes, positionId, availableQuantity){
  test('get create new SKU', async () => {
    let res = await sku_dao.insertSKU(new SKU(id, description, weight, volume, price, notes, availableQuantity, positionId));
    expect(res.length).toStrictEqual(1);
    res = await sku_dao.selectSKUbyID(id);
    expect(res.id).toStrictEqual(id);
    expect(res.description).toStrictEqual(description);
    expect(res.weight).toStrictEqual(weight);
    expect(res.volume).toStrictEqual(volume);
    expect(res.price).toStrictEqual(price);
    expect(res.notes).toStrictEqual(notes);
    expect(res.positionId).toStrictEqual(positionId);
    expect(res.availableQuantity).toStrictEqual(availableQuantity);
  });
}

async function testUpdateSKU(id, description, weight, volume, price, notes, positionId, availableQuantity){
  test('update a SKU', async () => {
    let res =  await sku_dao.selectSKUbyID(id);
    expect(res).not.toBeNull();
    res.description = description;
    res.weight = weight;
    res.volume = volume;
    res.price = price;
    res.notes = notes;
    res.positionId = positionId;
    res.availableQuantity = availableQuantity;
    await sku_dao.updateSKU(res);
    res = await sku_dao.selectSKUbyID(id);
    expect(res.id).toStrictEqual(id);
    expect(res.description).toStrictEqual(description);
    expect(res.weight).toStrictEqual(weight);
    expect(res.volume).toStrictEqual(volume);
    expect(res.price).toStrictEqual(price);
    expect(res.notes).toStrictEqual(notes);
    expect(res.positionId).toStrictEqual(positionId);
    expect(res.availableQuantity).toStrictEqual(availableQuantity);
  });
}

async function testDeleteSKU(id){
  test('delete SKU', async () => {
    let res = await sku_dao.selectSKUbyID(id);
    expect(res.id).toStrictEqual(id);
    expect(res.description).toStrictEqual(description);
    expect(res.weight).toStrictEqual(weight);
    expect(res.volume).toStrictEqual(volume);
    expect(res.price).toStrictEqual(price);
    expect(res.notes).toStrictEqual(notes);
    expect(res.positionId).toStrictEqual(positionId);
    expect(res.availableQuantity).toStrictEqual(availableQuantity);

    await sku_dao.deleteSKU(id);
    res = await sku_dao.selectSKUbyID(id);
    expect(res).toBeNull();
  });
}

describe("sku_dao", () => {
  beforeEach(async () => {
    await sku_dao.deleteSKUData();
    await sku_dao.insertSKU(new SKU(1,"sku1",100,50,10.99,"first SKU",50,"800234523412"));
    await sku_dao.insertSKU(new SKU(2,"sku2",101,51,11.99,"second SKU",51,"800234523413"));
  });

  testSKUs([ new SKU(1,"sku1",100,50,10.99,"first SKU",50,"800234523412"),
             new SKU(2,"sku2",101,51,11.99,"second SKU",51,"800234523413")]);

  testSKU(1,"sku1",100,50,10.99,"first SKU","800234523412",50)
  testSKU(2,"sku2",101,51,11.99,"second SKU","800234523413",51)
})