const TestResult = require("../components/TestResult");

class TestResultService {
    #testResult_DAO; #testDescriptor_DAO; #skuItem_DAO;

    constructor(testResult_DAO, testDescriptor_DAO, skuItem_DAO) {
        this.#testResult_DAO = testResult_DAO;
		this.#testDescriptor_DAO = testDescriptor_DAO;
		this.#skuItem_DAO = skuItem_DAO;
    }

	getTestResults = async (rfid) => {
		try {
			const SKUItem = await this.#skuItem_DAO.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResults = await this.#testResult_DAO.selectTestResults(rfid);
			return {status: 200, body: testResults.map((tr) => ({id: tr.id, idTestDescriptor: tr.idTestDescriptor, Date: tr.date, Result: Boolean(tr.result)}))};
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	getTestResultByID = async (rfid, id) => {
		try {
			const SKUItem = await this.#skuItem_DAO.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResult = await this.#testResult_DAO.selectTestResultByID(rfid, id);
			if (testResult) {
				return {status:200, body: {id: testResult.id, idTestDescriptor: testResult.idTestDescriptor, Date: testResult.date, Result: Boolean(testResult.result)}}
			} else {
				return {status: 404, body: "test result not found"};
			}
		} catch (e) {
			return {status: 500, body: e};
		}
	}
	
	createTestResult = async (rfid, idTestDescriptor, date, result) => {
		try {
			const SKUItem = await this.#skuItem_DAO.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testDescriptor = await this.#testDescriptor_DAO.selectTestDescriptorByID(idTestDescriptor);
			if (!testDescriptor) return {status: 404, body: "test descriptor not found"};
			await this.#testResult_DAO.insertTestResult(new TestResult(null, idTestDescriptor, date, result, rfid));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	updateTestResult = async (rfid, id, newIdTestDescriptor, newDate, newResult) => {
		try {
			const SKUItem = await this.#skuItem_DAO.selectSKUItemByRFID(rfid);
			if (!SKUItem) return {status: 404, body: "skuitem not found"};
			const testResult = await this.#testResult_DAO.selectTestResultByID(rfid, id);
			if (!testResult) return {status: 404, body: "test result not found"};
			const testDescriptor = await this.#testDescriptor_DAO.selectTestDescriptorByID(newIdTestDescriptor);
			if (!testDescriptor) return {status: 404, body: "test descriptor not found"};
	
			testResult.idTestDescriptor = newIdTestDescriptor;
			testResult.date = newDate;
			testResult.result = newResult;
			await this.#testResult_DAO.updateTestResult(testResult);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteTestResult = (rfid, id) => {
		return this.#testResult_DAO.deleteTestResultByID(rfid, id);
	}
}

module.exports = TestResultService;

