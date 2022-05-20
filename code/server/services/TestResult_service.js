const TestResult = require("../components/TestResult");

const TestDescriptor_DAO = require("../database/TestDescriptor_DAO");
const TestResult_DAO = require("../database/TestResult_DAO");
const SKUItem_DAO = require("../database/SKUItem_DAO");


exports.getTestResults = async (rfid) => {
	try {
		const SKUItem = await SKUItem_DAO.selectSKUItemByRFID(rfid);
		if (!SKUItem) return {status: 404, body: "skuitem not found"};
		const testResults = await TestResult_DAO.selectTestResults(rfid);
		return {status: 200, body: testResults.map((tr) => ({id: tr.id, idTestDescriptor: tr.idTestDescriptor, Date: tr.date, Result: tr.result}))};
	} catch (e) {
		return {status: 500, body: e};
	}
}

exports.getTestResultByID = async (rfid, id) => {
	try {
		const SKUItem = await SKUItem_DAO.selectSKUItemByRFID(rfid);
		if (!SKUItem) return {status: 404, body: "skuitem not found"};
		const testResult = await TestResult_DAO.selectTestResultByID(rfid, id);
		if (testResult) {
			return {status:200, body: {id: testResult.id, idTestDescriptor: testResult.idTestDescriptor, Date: testResult.date, Result: testResult.result}}
		} else {
			return {status: 404, body: "test result not found"};
		}
	} catch (e) {
		return {status: 500, body: e};
	}
}

exports.createTestResult = async (rfid, idTestDescriptor, date, result) => {
	try {
		const SKUItem = await SKUItem_DAO.selectSKUItemByRFID(rfid);
		if (!SKUItem) return {status: 404, body: "skuitem not found"};
		const testDescriptor = await TestDescriptor_DAO.selectTestDescriptorByID(idTestDescriptor);
		if (!testDescriptor) return {status: 404, body: "test descriptor not found"};
		await TestResult_DAO.insertTestResult(new TestResult(null, idTestDescriptor, date, result, rfid));
		return {status: 201, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.updateTestResult = async (rfid, id, newIdTestDescriptor, newDate, newResult) => {
	try {
		const SKUItem = await SKUItem_DAO.selectSKUItemByRFID(rfid);
		if (!SKUItem) return {status: 404, body: "skuitem not found"};
		const testResult = await TestResult_DAO.selectTestResultByID(rfid, id);
		if (!testResult) return {status: 404, body: "test result not found"};
		const testDescriptor = await TestDescriptor_DAO.selectTestDescriptorByID(newIdTestDescriptor);
		if (!testDescriptor) return {status: 404, body: "test descriptor not found"};

		testResult.idTestDescriptor = newIdTestDescriptor;
		testResult.date = newDate;
		testResult.result = newResult;
		await TestResult_DAO.updateTestResult(testResult);
		return {status: 200, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.deleteTestResult = (rfid, id) => {
	return TestResult_DAO.deleteTestResultByID(rfid, id);
}
