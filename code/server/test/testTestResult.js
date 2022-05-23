const { should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('test TestResult apis', () => {

    before(async () => {
        await agent.delete('/api/testResults'); //TEMPORARY
        await agent.delete('/api/testDescriptors'); //TEMPORARY
        await agent.delete('/api/skuitems'); //TEMPORARY
        await agent.delete('/skus'); //TEMPORARI
        await agent.post('/api/sku').send({ "description": "a new sku",
                                            "weight": 100, "volume": 50,
                                            "notes": "first SKU", "price": 10.99,
                                            "availableQuantity": 50});
        await agent.post('/api/skuitem').send({ "RFID":"12345678901234567890123456789016",
                                                "SKUId":1,
                                                "DateOfStock":"2021/11/29 12:30" });
        await agent.post('/api/testDescriptor').send({ "name":"test descriptor 1",
                                                       "procedureDescription":"This test is described by...",
                                                       "idSKU" :1});
        await agent.post('/api/testDescriptor').send({ "name":"test descriptor 2",
                                                       "procedureDescription":"This test is described by...",
                                                       "idSKU" :1});
    });

    newTestResult(201, '12345678901234567890123456789016', 1, '2021/11/28', true);
    newTestResult(404, '42348678911234567890123456789676', 1, '2021/11/28', true);
    newTestResult(404, '12345678901234567890123456789016', 3, '2021/11/28', true);
    newTestResult(201, '12345678901234567890123456789016', 2, '2021/11/28', true);
    newTestResult(422);
    newTestResult(422, 5, "ada", 2011/05/08, true);
    newTestResult(201, '12345678901234567890123456789016', 1, '2021/12/03', false);

    const testsResRFID =  [{ id: 1, idTestDescriptor: 1, Date: '2021/11/28', Result: true},
                           { id: 2, idTestDescriptor: 2, Date: '2021/11/28', Result: true},
                           { id: 3, idTestDescriptor: 1, Date: '2021/12/03', Result: false}];
    getTestResults(200, '12345678901234567890123456789016', testsResRFID);
    getTestResults(200, '12345678901234567890123456789016', testsResRFID[1], 2);
    getTestResults(404, '44345658901634567890123456789016', testsResRFID);
    getTestResults(404, '22345378901234567890123456789016', testsResRFID[1], 3);
    getTestResults(422, '22345378901234567890123456789016', testsResRFID[1], "abc");
    updateTestResult(200, '12345678901234567890123456789016', 3, 2,'2021/12/03', false);
    updateTestResult(422, '12345678901234567890123456789016', 3, 2, 'aaa', false);
    updateTestResult(422, '12345678901234567890123456789016', 3);
    updateTestResult(404, '45675678901234567890123456780987', 3, 2, '2021/12/03', true);
    updateTestResult(404, '12345678901234567890123456789016', 4, 2, '2021/12/03', true);
    deleteTestResult(204, '12345678901234567890123456789016', 2);
    getTestResults(404, '12345678901234567890123456789016', testsResRFID[1], 2);
    deleteTestResult(422, '12345678901234567890123456789016', "abc");
});

function deleteTestResult(expectedHTTPStatus, rfid, id) {
    it('Deleting test result', function (done) {
        agent.delete('/api/skuitems/' + rfid + '/testResult/' + id)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function newTestResult(expectedHTTPStatus, rfid, idTestDescriptor, Date, Result) {
    it('adding a new test result', function (done) {
        if (rfid !== undefined) {
            let testR = { rfid: rfid, idTestDescriptor: idTestDescriptor, Date: Date, Result: Result}
            agent.post('/api/skuitems/testResult')
                .send(testR)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/skuitems/testResult') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}


function getTestResults(expectedHTTPStatus, rfid, expectedTestsR, id) {
    it('getting test result data from the system', function (done) {
        if (id === undefined) { //ONLY RFID
            agent.get('/api/skuitems/' + rfid + '/testResults')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    if (res.status == 200) {
                        JSON.stringify(res.body).should.equal(JSON.stringify(expectedTestsR));
                    }
                    done();
                });
        } else {
            agent.get('/api/skuitems/' + rfid + '/testResults/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    if (res.status == 200) {
                        JSON.stringify(res.body).should.equal(JSON.stringify(expectedTestsR));
                    }
                    done();
                });
        }
    });
}

function updateTestResult(expectedHTTPStatus, rfid, id, newIdTestDescriptor, newDate, newResult) {
    it('update a test result', function (done) {
        if (newIdTestDescriptor !== undefined) {
            let testR = { newIdTestDescriptor: newIdTestDescriptor, newDate: newDate, newResult: newResult }
            agent.put('/api/skuitems/' + rfid + '/testResult/' + id)
                .send(testR)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put('/api/skuitems/' + rfid + '/testResult/' + id) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
