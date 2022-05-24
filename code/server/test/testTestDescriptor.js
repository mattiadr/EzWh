const { should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('test Test Descriptor apis', () => {

    before(async () => {
        await agent.delete('/api/testDescriptors'); //TEMPORARY
        await agent.delete('/api/skus'); //TEMPORARY
        await agent.post('/api/sku').send({ "description": "a new sku",
                                            "weight": 100, "volume": 50,
                                            "notes": "first SKU", "price": 10.99,
                                            "availableQuantity": 50});
    });

    after(async () => {
        await agent.delete('/api/testDescriptors'); //TEMPORARY
        await agent.delete('/api/skus'); //TEMPORARY
    });

    newTestDescriptor(201, 'test descriptor 1', 'This test is described by...', 1);
    newTestDescriptor(201, 'test descriptor 2', 'This test is described by...', 1);
    newTestDescriptor(422);
    newTestDescriptor(422, 0, 12);
    newTestDescriptor(404, 'test descriptor 3', 'This test is described by...', 2);
    getTestDescriptor(200, 1, 'test descriptor 1', 'This test is described by...', 1);
    getTestDescriptor(404, 3, 'test descriptor 3', 'This test is described by...', 2);
    const testsD =  [{ id: 1, name: 'test descriptor 1', procedureDescription: 'This test is described by...', idSKU: 1},
                     { id: 2, name: 'test descriptor 2', procedureDescription: 'This test is described by...', idSKU: 1}]
    getTestDescriptors(200, testsD);
    updateTestDescriptor(200, 2, '(updated) test descriptor 2', '(updated) This test is described by...', 1);
    updateTestDescriptor(422);
    updateTestDescriptor(422, 2, 3, 'aaa');
    updateTestDescriptor(422, 2, 3, 'bbb', "cc");
    updateTestDescriptor(404, 3, '(updated) test descriptor 3', 'This test is described by...', 1);
    updateTestDescriptor(404, 1, '(updated) test descriptor 1', 'This test is described by...', 2);
    getTestDescriptor(200, 2, '(updated) test descriptor 2', '(updated) This test is described by...', 1);
    getTestDescriptor(200, 1, 'test descriptor 1', 'This test is described by...', 1);
    deleteTestDescriptor(204, 2);
    getTestDescriptor(404, 2);
    deleteTestDescriptor(422, "abc");

});

function deleteTestDescriptor(expectedHTTPStatus, id) {
    it('Deleting test descriptor', function (done) {
        agent.delete('/api/testDescriptor/' + id)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function newTestDescriptor(expectedHTTPStatus, name, procedureDescription, idSKU) {
    it('adding a new test descriptor', function (done) {
        if (name !== undefined) {
            let testD = { name: name, procedureDescription: procedureDescription, idSKU: idSKU }
            agent.post('/api/testDescriptor')
                .send(testD)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/testDescriptor') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}


function getTestDescriptor(expectedHTTPStatus, id, name, procedureDescription, idSKU) {
    it('getting test descriptor data from the system', function (done) {
        agent.get('/api/testDescriptors/' + id)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                if (res.status == 200) {
                    res.body.id.should.equal(id);
                    res.body.name.should.equal(name);
                    res.body.procedureDescription.should.equal(procedureDescription);
                    res.body.idSKU.should.equal(idSKU);
                }
                done();
            });
    });
}

function getTestDescriptors(expectedHTTPStatus, expectedTestsD) {
    it('getting all test descriptors datas from the system', function (done) {
        agent.get('/api/testDescriptors')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                if (res.status == 200)
                    JSON.stringify(res.body).should.equal(JSON.stringify(expectedTestsD));
                done();
            });
    });
}

function updateTestDescriptor(expectedHTTPStatus, id, name, procedureDescription, idSKU) {
    it('update a test descriptor', function (done) {
        if (id !== undefined) {
            let testD = { newName: name, newProcedureDescription: procedureDescription, newIdSKU: idSKU }
            agent.put('/api/testDescriptor/' + id)
                .send(testD)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put('/api/testDescriptor/' + id) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
