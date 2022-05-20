const TestDescriptor = require("../components/TestDescriptor");


class TestDescriptorService {
    testD_dao; sku_dao; 

    constructor(testD_dao, sku_dao) {
		this.testD_dao = testD_dao;
		this.sku_dao = sku_dao;
    }

	getTestDescriptors = () => {
		return this.testD_dao.selectTestDescriptors();
	}
	
	getTestDescriptorByID = (id) => {
		return this.testD_dao.selectTestDescriptorByID(id);
	}
	
	createTestDescriptor = async (name, procedureDescription, idSKU) => {
		try {
			const SKU = await this.sku_dao.selectSKUbyID(idSKU);
			if (!SKU) return {status: 404, body: "sku not found"};
			await this.testD_dao.insertTestDescriptor(new TestDescriptor(null, name, procedureDescription, idSKU));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	updateTestDescriptor = async (id, newName, newProcedureDescription, newIdSKU) => {
		try {
			const testDescriptor = await this.testD_dao.selectTestDescriptorByID(id);
			if (!testDescriptor) return {status: 404, body: "id not found"};
			const SKU = await this.sku_dao.selectSKUbyID(newIdSKU);
			if (!SKU) return {status: 404, body: "sku not found"};
	
			testDescriptor.name = newName;
			testDescriptor.procedureDescription = newProcedureDescription;
			testDescriptor.idSKU = newIdSKU;
			await this.testD_dao.updateTestDescriptor(testDescriptor);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteTestDescriptor = (id) => {
		return this.testD_dao.deleteTestDescriptorByID(id);
	}
	
}

module.exports = TestDescriptorService;