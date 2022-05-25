const TestDescriptor = require('../components/TestDescriptor');
const SKU = require('../components/SKU');
const TestDescriptorService = require('../services/TestDescriptor_service');
const testD_dao = require('../database/TestDescriptor_DAO');
const sku_dao = require('../database/SKU_DAO');
const TestDescriptor_service = new TestDescriptorService(testD_dao, sku_dao);

async function testTestDescriptors(expectedTestDescriptors) {
    test('get all Test Descriptors', async () => {
        let res = await TestDescriptor_service.getTestDescriptors();
        expect(res).toEqual(expectedTestDescriptors);
    });
}

async function testTestDescriptor(id, name, procedureDescription, idSKU) {
    test('get Test Descriptor', async () => {
        let res = await TestDescriptor_service.getTestDescriptorByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedureDescription);
        expect(res.idSKU).toStrictEqual(idSKU);
    });
}

// test case definition
describe('get testDescriptors', () => {

    beforeEach(async () => {
        await testD_dao.deleteTestDescriptorData();
        await testD_dao.insertTestDescriptor(new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1));
        await testD_dao.insertTestDescriptor(new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1));
    });

    const TestDescriptors = [new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1),
                             new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1)]

    testTestDescriptors(TestDescriptors);
    testTestDescriptor(TestDescriptors[0].id, TestDescriptors[0].name, TestDescriptors[0].procedureDescription, TestDescriptors[0].idSKU);
    testTestDescriptor(TestDescriptors[1].id, TestDescriptors[1].name, TestDescriptors[1].procedureDescription, TestDescriptors[1].idSKU);

});

describe("set TestDescriptor", () => {

    beforeEach(async () => {
        await testD_dao.deleteTestDescriptorData();
        await sku_dao.deleteSKUData();
        await testD_dao.insertTestDescriptor(new TestDescriptor(1, 'test descriptor 1', 'This test is described by...', 1));
        await testD_dao.insertTestDescriptor(new TestDescriptor(2, 'test descriptor 2', 'This test is described by...', 1));
        await sku_dao.insertSKU(new SKU(1, "first sku", 60, 20, 10.99, "notes: ...", 50, "800234543412"));
    });

    test('new TestDescriptor', async () => {
        const Test3 = new TestDescriptor(3, 'test descriptor 3', 'This test is described by...', 1);
        const Test4 = new TestDescriptor(4, 'test descriptor 4', 'This test is described by...', 4);

        let res = await TestDescriptor_service.createTestDescriptor(Test3.name, Test3.procedureDescription, Test3.idSKU);
        expect(res.status).toEqual(201);
        res = await TestDescriptor_service.getTestDescriptorByID(Test3.id);
        expect(res).toEqual(Test3);

        res = await TestDescriptor_service.createTestDescriptor(Test4.name, Test4.procedureDescription, Test4.idSKU);
        expect(res.status).toEqual(404);
        res = await TestDescriptor_service.getTestDescriptorByID(Test4.id);
        expect(res).toBeNull();
    });

    test('update TestDescriptor', async () => {
        const Test1 = new TestDescriptor(1, '(updated)test descriptor 1', 'This test is described by...', 1);
        const Test2 = new TestDescriptor(2, '(updated)test descriptor 2', 'This test is described by...', 4);
        const Test5 = new TestDescriptor(5, '(updated)test descriptor 5', 'This test is described by...', 2);
        

        let res = await TestDescriptor_service.updateTestDescriptor(Test1.id, Test1.name, Test1.procedureDescription, Test1.idSKU);
        expect(res.status).toEqual(200);
        res = await TestDescriptor_service.getTestDescriptorByID(Test1.id);
        expect(res).toEqual(Test1);

        res = await TestDescriptor_service.updateTestDescriptor(Test2.id, Test2.name, Test2.procedureDescription, Test2.idSKU);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("sku not found");
        res = await TestDescriptor_service.getTestDescriptorByID(Test2.id);
        expect(res).toEqual({});

        res = await TestDescriptor_service.updateTestDescriptor(Test5.id, Test5.name, Test5.procedureDescription, Test5.idSKU);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
        res = await TestDescriptor_service.getTestDescriptorByID(Test5.id);
        expect(res).toBeNull();
    });
});

describe("delete TestDescriptor", () => {
    beforeEach(async () => {
        await testD_dao.deleteTestDescriptorData();
        await testD_dao.insertTestDescriptor(new TestDescriptor(1, 'test descriptor 1', 'This test is described by...', 1));
    });
    test('delete TestDescriptor', async () => {
        const idTest = 1;
        let res = await TestDescriptor_service.deleteTestDescriptor(idTest);
        expect(res).toEqual(true);
        res = await TestDescriptor_service.getTestDescriptorByID(idTest);
        expect(res).toBeNull();

    });
});