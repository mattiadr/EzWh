const TestResult = require('../components/TestResult');
const TestDescriptor = require('../components/TestDescriptor');
const SKUItem = require('../components/SKUItem');
const TestResultService = require('../services/TestResult_service');
const testR_dao = require('../database/TestResult_DAO');
const testD_dao = require('../database/TestDescriptor_DAO');
const SI_dao = require('../database/SKUItem_dao');
const TestResult_service = new TestResultService(testR_dao, testD_dao, SI_dao);
const DatabaseConnection = require("../database/DatabaseConnection");

async function testTestResults(rfid,expectedTestResults) {
    test('get all Test Results', async () => {
        let res = await TestResult_service.getTestResults(rfid);
        expect(res.rfid).toEqual(rfid);
        expect(res.expectedTestResults).toEqual(expectedTestResults);
    });
}

async function testTestResult(id, idTestDescriptor, date, result, rfid) {
    test('get Test Descriptor', async () => {
        let res = await TestResult_service.getTestResultByID(rfid,id);
        expect(res.id).toStrictEqual(id);
        expect(res.idTestDescriptor).toStrictEqual(idTestDescriptor);
        expect(res.date).toStrictEqual(date);
        expect(res.result).toStrictEqual(result);
        expect(res.rfid).toStrictEqual(rfid);
    });
}

// test case definition
describe('get Test Results', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });

    beforeEach(async () => {
        await testR_dao.deleteTestResultData();
        await testD_dao.insertTestDescriptor(new TestDescriptor(12, 'test descriptor 1', 'This test is described by...', 1))
        await SI_dao.insertSKUItem(new SKUItem("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"))
        await testR_dao.insertTestResult(new TestResult(1, 12, "2021/11/29", false, "12345678901234567890123456789014"));
        await testR_dao.insertTestResult(new TestResult(2, 12, "2021/11/29", false, "12345678901234567890123456789014"));
    });

    const TestResults = [new TestResult(1, 12, "2021/11/29", false, "12345678901234567890123456789014"),
                         new TestResult(2, 12, "2021/11/29", false, "12345678901234567890123456789014")]
    const rfid = "12345678901234567890123456789014"
    testTestResults(rfid,TestResults);
    testTestResult(TestResults[0].id, TestResults[0].name, TestResults[0].procedureDescription, TestResults[0].idSKU);
    testTestResult(TestResults[1].id, TestResults[1].name, TestResults[1].procedureDescription, TestResults[1].idSKU);

});

describe("set Test Result", () => {

    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await testR_dao.deleteTestResultData();
        await testD_dao.deleteTestDescriptorData();
        await SI_dao.deleteSKUItemData();
        await testR_dao.insertTestResult(new TestResult(1, 12, "2021/11/29", false, "12345678901234567890123456789014"));
        await testR_dao.insertTestResult(new TestResult(2, 12, "2021/11/29", false, "12345678901234567890123456789014"));
        await testD_dao.insertTestDescriptor(new TestDescriptor(12, 'test descriptor 1', 'This test is described by...', 1))
        await SI_dao.insertSKUItem(new SKUItem ("12345678901234567890123456789014", 1, 0, "2021/11/29 12:30"));
    });

    test('new Test Result', async () => {
        const Test3 = new TestResult(3, 12, "2021/11/29", false, "12345678901234567890123456789014");
        const Test4 = new TestResult(4, 12, "2021/11/29", false, "12345678901234567890123456789018");

        let res = await TestResult_service.createTestResult(Test3.id, Test3.idTestDescriptor, Test3.date, Test3.result, Test3.rfid);
        expect(res.status).toEqual(201);
        res = await TestResult_service.getTestResultByID(Test3.rfid, Test3.id);
        expect(res).toEqual(Test3);

        res = await TestResult_service.createTestResult(Test4.id, Test4.idTestDescriptor, Test4.date, Test4.result, Test4.rfid);
        expect(res.status).toEqual(404);
        res = await TestResult_service.getTestResultByID(Test4.rfid, Test4.id);
        expect(res).toBeNull();
    });

    test('update Test Result', async () => {
        const Test1 = new TestResult(1, 12, "2021/11/29", true, "12345678901234567890123456789014");
        const Test2 = new TestResult(2, 14, "2021/11/29", true, "12345678901234567890123456789014");
        const Test5 = new TestResult(5, 12, "2021/11/29", true, "12345678901234567890123456789014");
        

        let res = await TestResult_service.updateTestResult(Test1.id, Test1.idTestDescriptor, Test1.date, Test1.result, Test1.rfid);
        expect(res.status).toEqual(200);
        res = await TestResult_service.getTestResultByID(Test1.rfid, Test1.id);
        expect(res).toEqual(Test1);

        res = await TestResult_service.updateTestResult(Test2.id, Test2.idTestDescriptor, Test2.date, Test2.result, Test2.rfid);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("test descriptor not found");
        res = await TestResult_service.getTestResultByID(Test2.rfid, Test2.id);
        expect(res).toEqual({});

        res = await TestResult_service.updateTestResult(Test5.id, Test5.idTestDescriptor, Test5.date, Test5.result, Test5.rfid);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
        res = await TestResult_service.getTestResultByID(Test5.rfid, Test5.id);
        expect(res).toBeNull();
    });
});

describe("delete TestDescriptor", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await testR_dao.deleteTestResultData();
        await testR_dao.insertTestResult(new TestResult(1, 12, "2021/11/29", true, "12345678901234567890123456789014"));
    });
    test('delete TestDescriptor', async () => {
        const id = 1;
        const rfid = "12345678901234567890123456789014"
        let res = await TestResult_service.deleteTestResult(rfid, id);
        res = await TestResult_service.getTestResultByID(rfid,id);
        expect(res).toBeNull();

    });
});