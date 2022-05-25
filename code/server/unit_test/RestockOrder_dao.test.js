const RKO_dao = require('../database/RestockOrder_DAO');
const RestockOrder = require('../components/RestockOrder');

async function testRestockOrders(expectedRestockOrders) {
    test('get all Restock Orders', async () => {
        let res = await RKO_dao.selectRestockOrders();
        expect(res).toEqual(expectedRestockOrders);
    });
}