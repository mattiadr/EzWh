const I_dao = require('../database/Item_DAO');
const Item = require('../components/Item');

async function testItems(expectedItems) {
    test('get all Items', async () => {
        let res = await I_dao.selectItems();
        expect(res).toEqual(expectedItems);
    });
}