const TestResult = require("../components/TestResult");

class TestResultService {
    testR_dao; testD_dao; skuItem_dao;

    constructor(testR_dao, testD_dao, skuItem_dao) {
        this.testR_dao = testR_dao;
		this.testD_dao = testD_dao;
		this.skuItem_dao = skuItem_dao;
    }

	getTestResults = async (rfid) => {
		try {
			const SKUItem = await this.skuItem_dao.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResults = await this.testR_dao.selectTestResults(rfid);
			return {status: 200, body: testResults.map((tr) => ({id: tr.id, idTestDescriptor: tr.idTestDescriptor, Date: tr.date, Result: tr.result}))};
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	getTestResultByID = async (rfid, id) => {
		try {
			const SKUItem = await this.skuItem_dao.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResult = await this.testR_dao.selectTestResultByID(rfid, id);
			if (testResult) {
				return {status:200, body: {id: testResult.id, idTestDescriptor: testResult.idTestDescriptor, Date: testResult.date, Result: testResult.result}}
			} else {
				return {status: 404, body: "test result not found"};
			}
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	createTestResult = async (rfid, idTestDescriptor, date, result) => {
		try {
			const SKUItem = await this.skuItem_dao.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testDescriptor = await this.testD_dao.selectTestDescriptorByID(idTestDescriptor);
			if (!testDescriptor) return {status: 404, body: "test descriptor not found"};
			await this.testR_dao.insertTestResult(new TestResult(null, idTestDescriptor, date, result, rfid));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	updateTestResult = async (rfid, id, newIdTestDescriptor, newDate, newResult) => {
		try {
			const SKUItem = await this.skuItem_dao.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResult = await this.testR_dao.selectTestResultByID(rfid, id);
			if (!testResult) return {status: 404, body: "test result not found"};
			const testDescriptor = await this.testD_dao.selectTestDescriptorByID(newIdTestDescriptor);
			if (!testDescriptor) return {status: 404, body: "test descriptor not found"};
	
			testResult.idTestDescriptor = newIdTestDescriptor;
			testResult.date = newDate;
			testResult.result = newResult;
			await this.testR_dao.updateTestResult(testResult);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteTestResult = (rfid, id) => {
		return this.testR_dao.deleteTestResultByID(rfid, id);
	}	
}

module.exports = TestResultService;

