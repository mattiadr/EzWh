const { should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('test user apis', () => {

    before(async () => {
        await agent.delete("/api/resetDatabase");
    });

    newUser(201, 'user2@ezwh.com', 'Lucas', 'Smith', 'testpassword', 'customer');
    newUser(201, 'michael.jordan@supplier.ezwh.com', 'Michael', 'Jordan', 'testpassword', 'supplier');
    newUser(409, 'michael.jordan@supplier.ezwh.com', 'Mich', 'Jo', 'testpassword', 'supplier');
    newUser(422);
    newUser(422, 'john.snow@supplier.ezwh.com', 'John', 'Snow', 'testpassword', 'ciao007');
    newUser(422, 'john.snow@supplier.ezwh.com', 'John', 'Snow', 'less8', 'supplier');
    newUser(422, 'ciao007', "Jhon", 'Snow', 'testpassword', 'supplier');
    newUser(201, 'john.snow@supplier.ezwh.com', 'John', 'Snow', 'testpassword', 'supplier');
    const newUsers = [{ id: 7, name: 'Lucas', surname: 'Smith', email: 'user2@ezwh.com', type: 'customer'},
                      { id: 8, name: 'Michael', surname: 'Jordan', email: 'michael.jordan@supplier.ezwh.com', type: 'supplier'},
                      { id: 9, name: 'John', surname: 'Snow', email: 'john.snow@supplier.ezwh.com', type: 'supplier'}]
    getUsers(200, newUsers);
    const newSuppliers = [{ id: 8, name: 'Michael', surname: 'Jordan', email: 'michael.jordan@supplier.ezwh.com'},
                          { id: 9, name: 'John', surname: 'Snow', email: 'john.snow@supplier.ezwh.com'}]
    getSuppliers(200, newSuppliers);
    userSession(200, 'customer', 7, 'user2@ezwh.com', "testpassword", "Lucas", "Smith");
    userSession(200, 'supplier', 8, 'michael.jordan@supplier.ezwh.com', "testpassword", "Michael", "Jordan");
    userSession(401, 'customer'); 
    userSession(401, 'supplier');
    userSession(401, 'manager', 7, 'user2@ezwh.com', "testpassword", "Lucas", "Smith");
    userSession(401, 'clerk', 7, 'user2@ezwh.com', "testpassword", "Lucas", "Smith");
    userSession(401, 'qualityEmployee', 7, 'user2@ezwh.com', "testpassword", "Lucas", "Smith");
    userSession(401, 'deliveryEmployee', 7, 'user2@ezwh.com', "testpassword", "Lucas", "Smith");
    newUser(201, 'maurisio@ezwh.com', 'Maurizio', 'Morisio', 'PoliTo2022', 'qualityEmployee');
    userSession(401, 'qualityEmployee', 10, 'maurisio@ezwh.com', "testpassword", "Maurizio", "Morisio");
    updateUserPermission(200, "user2@ezwh.com", "customer", "clerk");
    updateUserPermission(404, "user2@ezwh.com", "customer", "supplier");
    updateUserPermission(422, "user2@ezwh.com", "clerk", "manager");
    deleteUser(204, "user2@ezwh.com", "clerk");
    deleteUser(422, "ciao", "clerk");
    deleteUser(422, "maurisio@ezwh.com", "manager");
});

function newUser(expectedHTTPStatus, username, name, surname, password, type) {
    it('adding a new user', function (done) {
        if (name !== undefined) {
            let user = { username: username, name: name, surname: surname, password: password, type: type}
            agent.post('/api/newUser')
                .send(user)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/newUser') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function getUsers(expectedHTTPStatus, expectedUsers) {
    it('getting all users datas from the system', function (done) {
        agent.get('/api/users')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                if (res.status == 200)
                    JSON.stringify(res.body.slice(5)).should.equal(JSON.stringify(expectedUsers));
                done();
            });
    });
}

function getSuppliers(expectedHTTPStatus, expectedSuppliers) {
    it('getting all suppliers datas from the system', function (done) {
        agent.get('/api/suppliers')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                if (res.status == 200)
                    JSON.stringify(res.body.slice(1)).should.equal(JSON.stringify(expectedSuppliers));
                done();
            });
    });
}

function userSession(expectedHTTPStatus, type, id, username, password, name, surname) {
    it('new user session', function (done) {
        console.log(username);
        if (username !== undefined) {
            let session = { username: username, password: password }
            agent.post('/api/' + type + 'Sessions')
                .send(session)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    if (res.status == 200) {
                        res.body.id.should.equal(id);
                        res.body.username.should.equal(username);
                        res.body.name.should.equal(name);
                        res.body.surname.should.equal(surname);
                    }
                    done();
                });
        } else {
            agent.post('/api/' + type + 'Sessions') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function updateUserPermission(expectedHTTPStatus, username, oldType, newType) {
    it('update a user permission', function (done) {
        if (oldType !== undefined) {
            let type = { oldType: oldType, newType: newType }
            agent.put('/api/users/' + username)
                .send(type)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put('/api/users/' + username) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function deleteUser(expectedHTTPStatus, username, type) {
    it('Delete user', function (done) {
        agent.delete('/api/users/' + username +'/' + type)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}