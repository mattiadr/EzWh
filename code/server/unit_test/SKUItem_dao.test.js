const SI_dao = require('../database/SKUItem_DAO');
const SKUItem = require('../components/SKUItem');

async function testSKUItems(expectedSKUItems) {
    test('get all SKUItems', async () => {
        let res = await SI_dao.selectSKUItems();
        expect(res).toEqual(expectedSKUItems);
    });
}