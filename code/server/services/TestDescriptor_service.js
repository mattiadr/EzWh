const TestDescriptor = require("../components/TestDescriptor");

const TestDescriptor_DAO = require("../database/TestDescriptor_DAO");
const SKU_DAO = require("../database/SKU_DAO");


exports.getTestDescriptors = () => {
	return TestDescriptor_DAO.selectTestDescriptors();
}

exports.getTestDescriptorByID = (id) => {
	return TestDescriptor_DAO.selectTestDescriptorByID(id);
}

exports.createTestDescriptor = async (name, procedureDescription, idSKU) => {
	try {
		const SKU = await SKU_DAO.selectSKUbyID(idSKU);
		if (!SKU) return {status: 404, body: "sku not found"};
		await TestDescriptor_DAO.insertTestDescriptor(new TestDescriptor(null, name, procedureDescription, idSKU));
		return {status: 201, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.updateTestDescriptor = async (id, newName, newProcedureDescription, newIdSKU) => {
	try {
		const testDescriptor = await TestDescriptor_DAO.selectTestDescriptorByID(id);
		if (!testDescriptor) return {status: 404, body: "id not found"};
		const SKU = await SKU_DAO.selectSKUbyID(newIdSKU);
		if (!SKU) return {status: 404, body: "sku not found"};

		testDescriptor.name = newName;
		testDescriptor.procedureDescription = newProcedureDescription;
		testDescriptor.idSKU = newIdSKU;
		await TestDescriptor_DAO.updateTestDescriptor(testDescriptor);
		return {status: 200, body: ""};
	} catch (e) {
		return {status: 503, body: e};
	}
}

exports.deleteTestDescriptor = (id) => {
	return TestDescriptor_DAO.deleteTestDescriptorByID(id);
}
