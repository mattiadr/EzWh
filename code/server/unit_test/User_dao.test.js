const U_dao = require('../database/User_DAO');
const User = require('../components/User');

async function testUsers(expectedUsers) {
    test('get all Users', async () => {
        let res = await U_dao.selectUsers();
        expect(res).toEqual(expectedUsers);
    });
}