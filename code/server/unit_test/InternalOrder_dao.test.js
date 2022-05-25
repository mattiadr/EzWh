const IO_dao = require('../database/InternalOrder_DAO');
const InternalOrder = require('../components/InternalOrder');

async function testInternalOrders(expectedInternalOrders) {
    test('get all Internal Orders', async () => {
        let res = await IO_dao.selectInternalOrders();
        expect(res).toEqual(expectedInternalOrders);
    });
}