const testD_dao = require('../database/TestDescriptor_DAO');
const TestDescriptor = require('../components/TestDescriptor');
const DatabaseConnection = require("../database/DatabaseConnection");

async function testTestDescriptors(expectedTestDescriptors) {
    test('get all Test Descriptors', async () => {
        let res = await testD_dao.selectTestDescriptors();
        expect(res).toEqual(expectedTestDescriptors);
    });
}

async function testTestDescriptor(id, name, procedureDescription, idSKU) {
    test('get Test Descriptor', async () => {
        let res = await testD_dao.selectTestDescriptorByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedureDescription);
        expect(res.idSKU).toStrictEqual(idSKU);
    });
}

async function testTestDescriptorsBySKUID(SKUID, expectedTestDescriptors) {
    test('get all Test Descriptors BY SKUID', async () => {
        let res = await testD_dao.selectTestDescriptorsIDBySKUID(SKUID);
        expect(res).toEqual(expectedTestDescriptors);
    });
}

async function testNewTestDescriptor(id, name, procedureDescription, idSKU){ //TESTING SELECT AND INSERT QUERY
    test('create new TestDescriptor', async () => {
        await testD_dao.insertTestDescriptor(new TestDescriptor(id, name, procedureDescription, idSKU));
        let res = await testD_dao.selectTestDescriptors();
        expect(res.length).toStrictEqual(1);
        res = await testD_dao.selectTestDescriptorByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedureDescription);
        expect(res.idSKU).toStrictEqual(idSKU);
    });
}

async function testUpdateTestDescriptor(id, name, procedureDescription, idSKU){ //TESTING SELECT AND INSERT QUERY
    test('update a TestDescriptor', async () => {
        let res = await testD_dao.selectTestDescriptorByID(id);
        expect(res).not.toBeNull();
        res.name = name;
        res.procedureDescription = procedureDescription;
        res.idSKU = idSKU;
        await testD_dao.updateTestDescriptor(res);
        res = await testD_dao.selectTestDescriptorByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedureDescription);
        expect(res.idSKU).toStrictEqual(idSKU);
    });
}

async function testDeleteTestDescriptor(id, name, procedureDescription, idSKU) {
    test('delete Test Descriptor', async () => {
        let res = await testD_dao.selectTestDescriptorByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedureDescription);
        expect(res.idSKU).toStrictEqual(idSKU);
        await testD_dao.deleteTestDescriptorByID(id);
        res = await testD_dao.selectTestDescriptorByID(id);
        expect(res).toBeNull();
    });
}

describe("testDao_selectTestDescriptors", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
<<<<<<< HEAD
        await DatabaseConnection.resetAllTables();
    });
=======
		await DatabaseConnection.resetAllTables();
    });

>>>>>>> 382dcc7887171628448b8ed3e324ebe4eb3cc9ff
    beforeEach(async () => {
        await testD_dao.deleteTestDescriptorData();
        await testD_dao.insertTestDescriptor(new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1));
        await testD_dao.insertTestDescriptor(new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1));
    });

    testTestDescriptors([ new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1),
                          new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1)]);
    testTestDescriptor(1, "test descriptor 1", "This test is described by...", 1);
    testTestDescriptor(2, "test descriptor 2", "This test is described by...", 1);
    testTestDescriptorsBySKUID(1, [1, 2]);
    //testTestDescriptor(3, "test descriptor 3", "This test is described by...", 1); // -> this test will fail

});

describe('testDao_newTestDescriptor', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
<<<<<<< HEAD
        await DatabaseConnection.resetAllTables();
    });
=======
		await DatabaseConnection.resetAllTables();
    });

>>>>>>> 382dcc7887171628448b8ed3e324ebe4eb3cc9ff
    beforeEach(async () => {
        await testD_dao.deleteTestDescriptorData();
    });

    test('db is empty', async () => {
        const res = await testD_dao.selectTestDescriptors();
        expect(res.length).toStrictEqual(0);
    });

    testNewTestDescriptor(1, "test descriptor 1", "This test is described by...", 1);
});

describe('testDao_updateTestDescriptor', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
<<<<<<< HEAD
        await DatabaseConnection.resetAllTables();
    });
    beforeAll(async () => {
=======
		await DatabaseConnection.resetAllTables();
>>>>>>> 382dcc7887171628448b8ed3e324ebe4eb3cc9ff
        await testD_dao.deleteTestDescriptorData();
        await testD_dao.insertTestDescriptor(new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1));
    });

    testUpdateTestDescriptor(1, "updated test descriptor 1", "(updated) This test is described by...", 2);
});

describe("testDao_deleteTestDescriptor", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
<<<<<<< HEAD
        await DatabaseConnection.resetAllTables();
    });
=======
		await DatabaseConnection.resetAllTables();
    });

>>>>>>> 382dcc7887171628448b8ed3e324ebe4eb3cc9ff
    beforeEach(async () => {
        await testD_dao.deleteTestDescriptorData();
        await testD_dao.insertTestDescriptor(new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1));
        await testD_dao.insertTestDescriptor(new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1));
    });
    testDeleteTestDescriptor(1, "test descriptor 1", "This test is described by...", 1);
    testDeleteTestDescriptor(2, "test descriptor 2", "This test is described by...", 1);
    //testTestDescriptor(3, "test descriptor 3", "This test is described by...", 1); // -> this test will fail
});


