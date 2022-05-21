const TestDescriptor = require('../components/TestDescriptor');
const SKU = require('../components/SKU');
const TestDescriptorService = require('../services/TestDescriptor_service');
const testD_dao = require('../mock_database/mock_TestDescriptor_dao');
const sku_dao = require('../mock_database/mock_SKU_dao');
const TestDescriptor_service = new TestDescriptorService(testD_dao, sku_dao);

// test case definition
describe('get testDescriptors', () => {

    beforeEach(() => {
        testD_dao.selectTestDescriptors.mockReset();
        testD_dao.selectTestDescriptorByID.mockReset();

        testD_dao.selectTestDescriptors.mockReturnValue(
            [ new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1),
              new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1),
              new TestDescriptor(3, "test descriptor 3", "This test is described by...", 2)
            ]);
        testD_dao.selectTestDescriptorByID.mockReturnValueOnce(
                new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1)
            ).mockReturnValueOnce(
                new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1)
            ).mockReturnValueOnce(
                new TestDescriptor(3, "test descriptor 3", "This test is described by...", 2)
            );
    });

    test('get all Test Descriptors', async () => {
        const testDescriptors = [ new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1),
                                  new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1),
                                  new TestDescriptor(3, "test descriptor 3", "This test is described by...", 2)];
        let res = await TestDescriptor_service.getTestDescriptors();
        expect(res).toEqual(testDescriptors);
    });

    test('get Test Descriptor By ID', async () => {
        res = await TestDescriptor_service.getTestDescriptorByID(1);
        expect(res).toEqual(new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1));

        res = await TestDescriptor_service.getTestDescriptorByID(2);
        expect(res).toEqual(new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1));

        res = await TestDescriptor_service.getTestDescriptorByID(3);
        expect(res).toEqual(new TestDescriptor(3, "test descriptor 1", "This test is described by...", 2));

        res = await TestDescriptor_service.getTestDescriptorByID(3);
        expect(res).toBe(undefined);
    });

});

describe("set TestDescriptor", () => {
    beforeEach(() => {
        sku_dao.selectSKUbyID.mockReset();
        testD_dao.selectTestDescriptorByID.mockReset();
        sku_dao.selectSKUbyID.mockReturnValueOnce( new SKU (1, "first sku", 60, 20, 10.99, "notes: ...", 50, "800234543412"));
        testD_dao.selectTestDescriptorByID.mockReturnValueOnce( new TestDescriptor(3, "test descriptor 3", "This test is described by...", 2))
                                          .mockReturnValueOnce( new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1));
    })
    test('new TestDescriptor', async () => {
        const Test2 = new TestDescriptor(null, 'test descriptor 2', 'This test is described by...', 1);
        const Test3 = new TestDescriptor(null, 'test descriptor 3', 'This test is described by...', 4);

        let res = await TestDescriptor_service.createTestDescriptor(Test2.name, Test2.procedureDescription, Test2.idSKU);

        expect(sku_dao.selectSKUbyID.mock.calls[0][0]).toBe(Test2.idSKU);
        expect(testD_dao.insertTestDescriptor.mock.calls[0][0]).toStrictEqual(Test2);
        expect(res.status).toEqual(201);

        res = await TestDescriptor_service.createTestDescriptor(Test3.name, Test3.procedureDescription, Test3.idSKU);
        expect(sku_dao.selectSKUbyID.mock.calls[1][0]).toBe(Test3.idSKU);
        expect(res.status).toEqual(404);
    });

    test('update TestDescriptor', async () => {
        const Test3 = new TestDescriptor(3, '(updated) test descriptor 3', 'This test is described by...', 1);
        const Test2 = new TestDescriptor(2, '(updated)test descriptor 2', 'This test is described by...', 4);
        const Test5 = new TestDescriptor(5, '(updated)test descriptor 5', 'This test is described by...', 2);
        

        let res = await TestDescriptor_service.updateTestDescriptor(Test3.id, Test3.name, Test3.procedureDescription, Test3.idSKU);
        expect(testD_dao.selectTestDescriptorByID.mock.calls[0][0]).toBe(Test3.id);
        expect(sku_dao.selectSKUbyID.mock.calls[0][0]).toBe(Test3.idSKU);
        expect(testD_dao.updateTestDescriptor.mock.calls[0][0]).toStrictEqual(Test3);
        expect(res.status).toEqual(200);

        res = await TestDescriptor_service.updateTestDescriptor(Test2.id, Test2.name, Test2.procedureDescription, Test2.idSKU);
        expect(testD_dao.selectTestDescriptorByID.mock.calls[1][0]).toBe(Test2.id);
        expect(sku_dao.selectSKUbyID.mock.calls[1][0]).toBe(Test2.idSKU);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("sku not found");

        res = await TestDescriptor_service.updateTestDescriptor(Test5.id, Test5.name, Test5.procedureDescription, Test5.idSKU);
        expect(testD_dao.selectTestDescriptorByID.mock.calls[2][0]).toBe(Test5.id);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
    });

});

describe("delete TestDescriptor", () => {
    beforeEach(() => {
        testD_dao.deleteTestDescriptorByID.mockReset();
        testD_dao.deleteTestDescriptorByID.mockReturnValueOnce(true);
    })
    test('delete TestDescriptor', async () => {
        const idTest = 1;
        let res = await TestDescriptor_service.deleteTestDescriptor(idTest);

        expect(testD_dao.deleteTestDescriptorByID.mock.calls[0][0]).toBe(idTest);
        expect(res).toEqual(true);
    });
});
