const TestDescriptor = require("../components/TestDescriptor");


class TestDescriptorService {
    #testDescriptor_DAO; #sku_DAO;

    constructor(testDescriptor_DAO, sku_DAO) {
		this.#testDescriptor_DAO = testDescriptor_DAO;
		this.#sku_DAO = sku_DAO;
    }

	getTestDescriptors() {
		return this.#testDescriptor_DAO.selectTestDescriptors();
	}
	
	getTestDescriptorByID(id) {
		return this.#testDescriptor_DAO.selectTestDescriptorByID(id);
	}
	
	async createTestDescriptor(name, procedureDescription, idSKU) {
		try {
			const SKU = await this.#sku_DAO.selectSKUbyID(idSKU);
			if (!SKU) return {status: 404, body: "sku not found"};
			await this.#testDescriptor_DAO.insertTestDescriptor(new TestDescriptor(null, name, procedureDescription, idSKU));
			return {status: 201, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	async updateTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
		try {
			const testDescriptor = await this.#testDescriptor_DAO.selectTestDescriptorByID(id);
			if (!testDescriptor) return {status: 404, body: "id not found"};
			const SKU = await this.#sku_DAO.selectSKUbyID(newIdSKU);
			if (!SKU) return {status: 404, body: "sku not found"};
	
			testDescriptor.name = newName;
			testDescriptor.procedureDescription = newProcedureDescription;
			testDescriptor.idSKU = newIdSKU;
			await this.#testDescriptor_DAO.updateTestDescriptor(testDescriptor);
			return {status: 200, body: ""};
		} catch (e) {
			return {status: 503, body: e};
		}
	}
	
	deleteTestDescriptor(id) {
		return this.#testDescriptor_DAO.deleteTestDescriptorByID(id);
	}
}

module.exports = TestDescriptorService;