const { should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe.only('test Restock Order apis', () => {

    before(async () => {
        await agent.delete('/api/items'); //TEMPORARY
        await agent.delete('/api/skus'); //TEMPORARY
        await agent.delete('/api/restockOrders'); //TEMPORARY
        await agent.post('/api/sku').send({ "description": "a new sku",
                                            "weight": 100, "volume": 50,
                                            "notes": "first SKU", "price": 10.99,
                                            "availableQuantity": 50});
        await agent.post('/api/sku').send({ "description": "a new sku",
                                            "weight": 200, "volume": 50,
                                            "notes": "second SKU", "price": 11.99,
                                            "availableQuantity": 50});
        await agent.post('/api/item').send({"id":1, "description" : "a product", 
                                            "price" : 10.99, "SKUId" : 1, "supplierId" : 2});
        await agent.post('/api/item').send({"id":2, "description" : "another product", 
                                            "price" : 11.99, "SKUId" : 2, "supplierId" : 2});                                   

        
    });

    const products1 = [ {"SKUId": 1, "description": "a product", "price": 10.99, "qty": 30},
                        {"SKUId": 2, "description": "another product", "price": 11.99, "qty": 20}];
    const products2 = [ {"SKUId": 1,"description": "a product", "price": 10.99, "qty": 10}];

    newRestockOrder(201, "2021/11/29 09:33", products1, 1);
    newRestockOrder(422, "abc", products1, 1);
    newRestockOrder(422, "2021/11/29 09:33", products1, "abc");
    newRestockOrder(422, "2021/11/29 09:33", "abc", 1);
    newRestockOrder(201, "2021/12/14 10:04", products2, 2);

    updateStateRestockOrder(422, 1, "ciao");
    updateStateRestockOrder(422, "ciao", "DELIVERED");
    updateStateRestockOrder(404, 3, "DELIVERED");
    updateStateRestockOrder(200, 1, "DELIVERED");

    updateTransportNoteRestockOrder(404, 3, {"deliveryDate": "2021/12/29"});
    updateTransportNoteRestockOrder(422, "ciao", {"deliveryDate": "2021/12/29"});
    updateTransportNoteRestockOrder(422, 2);
    updateTransportNoteRestockOrder(422, 2, {"deliveryDate": "2021/12/29"});
    updateTransportNoteRestockOrder(422, 1, {"deliveryDate": "2021/11/19"});
    updateTransportNoteRestockOrder(422, 2, {"abc": "2021/12/13"});
    updateTransportNoteRestockOrder(422, 2, {"deliveryDate": "abc"});
    updateStateRestockOrder(200, 1, "DELIVERY");
    updateTransportNoteRestockOrder(200, 1, {"deliveryDate": "2021/11/30"});

    const skuitems = [{"SKUId":12,"rfid":"12345678901234567890123456789016"},{"SKUId":12,"rfid":"12345678901234567890123456789017"}];
    updateSkuItemsRestockOrder(404, 3, skuitems);
    updateSkuItemsRestockOrder(422);
    updateSkuItemsRestockOrder(422, "ciao", skuitems);
    updateSkuItemsRestockOrder(422, 1, skuitems);
    updateSkuItemsRestockOrder(422, 2, "abc");
    updateStateRestockOrder(200, 2, "DELIVERED");
    updateSkuItemsRestockOrder(200, 2, skuitems);

    const restockOrders = [{"id": 1, "issueDate": "2021/11/29 09:33", "state": "DELIVERY", "products": products1, "supplierId" : 1, "transportNote":{"deliveryDate": "2021/11/30"}, "skuItems" : []},
                           {"id": 2, "issueDate": "2021/12/14 10:04", "state": "DELIVERED", "products": products2, "supplierId" : 2, "transportNote":{"deliveryDate": "Invalid Date"}, "skuItems" : skuitems}]
    
    //getRestockOrders(200, restockOrders);

    deleteRestockOrder(204, 2);
    deleteRestockOrder(422, "abc");

});

function deleteRestockOrder(expectedHTTPStatus, id) {
    it('Deleting restock order', function (done) {
        agent.delete('/api/restockOrder/' + id)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function newRestockOrder(expectedHTTPStatus, issueDate, products, supplierId) {
    it('adding a new restock order', function (done) {
        if (issueDate !== undefined) {
            let restockOrder = { issueDate: issueDate, products: products, supplierId: supplierId}
            agent.post('/api/restockOrder')
                .send(restockOrder)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/restockOrder') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}


function getRestockOrders(expectedHTTPStatus, expectedOrders) {
    it('getting restock orders datas from the system', function (done) {
        agent.get('/api/restockOrders')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                console.log(res.status);
                console.log(expectedOrders);
                console.log("==================");
                console.log(res.body);
                if (res.status == 200) {
                    JSON.stringify(res.body).should.equal(JSON.stringify(expectedItems));
                }
                done();
            });
    });
}

function updateStateRestockOrder(expectedHTTPStatus, id, newState) {
    it('update state of a restock order', function (done) {
        if (newState !== undefined) {
            let newS = { newState: newState };
            agent.put('/api/restockOrder/' + id)
                .send(newS)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put('/api/restockOrder/' + id) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function updateTransportNoteRestockOrder(expectedHTTPStatus, id, transportNote) {
    it('update transport note of a restock order', function (done) {
        if (transportNote !== undefined) {
            let newNote = { transportNote: transportNote };
            agent.put('/api/restockOrder/' + id + '/transportNote')
                .send(newNote)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put('/api/restockOrder/' + id + '/transportNote') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function updateSkuItemsRestockOrder(expectedHTTPStatus, id, skuitems) {
    it('insert sku items in a restock order', function (done) {
        if (skuitems !== undefined) {
            let skuI = { skuItems: skuitems };
            agent.put('/api/restockOrder/' + id + '/skuItems')
                .send(skuI)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put('/api/restockOrder/' + id + '/skuItems') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
