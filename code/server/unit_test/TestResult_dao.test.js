const testR_dao = require('../database/TestResult_DAO');
const TestResult = require('../components/TestResult');

async function testTestResults(expectedTestResults) {
    test('get all Test Results', async () => {
        let res = await testR_dao.selectTestResults();
        expect(res).toEqual(expectedTestResults);
    });
}