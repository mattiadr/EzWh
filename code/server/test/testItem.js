const { should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('test Item apis', () => {

    before(async () => {
        await agent.delete("/api/resetDatabase");
        await agent.post('/api/sku').send({ "description": "a new sku",
                                            "weight": 100, "volume": 50,
                                            "notes": "first SKU", "price": 10.99,
                                            "availableQuantity": 50});
        await agent.post('/api/sku').send({ "description": "a new sku",
                                            "weight": 70, "volume": 30,
                                            "notes": "second SKU", "price": 29.99,
                                            "availableQuantity": 25});
    });

    newItem(201, 12, 'new item', 10.99, 1, 2);
    newItem(404, 13, 'new item', 19.99, 3, 2);
    newItem(422);
    newItem(422, 'ciao', 'new item', 10.99, 2, 3);
    newItem(422, 13, 'new item', 19.99, 1, 2);
    newItem(422, 12, 'new item', 19.99, 2, 2);
    newItem(201, 13, 'new item', 19.99, 2, 3);

    const items =  [{ id: 12, description: 'new item', price: 10.99, SKUId: 1, supplierId: 2},
                    { id: 13, description: 'new item', price: 19.99, SKUId: 2, supplierId: 3}];
    getItems(200, items);
    getItems(200, items[0], 12, 2);
    getItems(404, items, 12, 3);
    getItems(422, items[0], '2a');
    getItems(422, items[0], 4, "abc");
    
    updateItem(200, 13, 3, '(update) new item', 11.99);
    updateItem(422, 12, 2);
    updateItem(422, 12, 2, '(update) new item', 'abc');
    updateItem(404, 10, 10, '(update) new item', 21.99);
    
    deleteItem(204, 13, 3);
    getItems(404, items[1], 13, 3);
    deleteItem(422, "abc", 2);
    deleteItem(422, 12, "def");
});

function deleteItem(expectedHTTPStatus, id, supplierId) {
    it('Deleting item', function (done) {
        agent.delete(`/api/items/${id}/${supplierId}`)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function newItem(expectedHTTPStatus, id, description, price, SKUId, supplierId) {
    it('adding a new Item', function (done) {
        if (id !== undefined) {
            let item = { id: id, description: description, price: price, SKUId: SKUId, supplierId: supplierId}
            agent.post('/api/item')
                .send(item)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/item') //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}


function getItems(expectedHTTPStatus, expectedItems, id, supplierId) {
    it('getting item datas from the system', function (done) {
        if (id === undefined) { //ALL ITEMS
            agent.get('/api/items')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    if (res.status == 200) {
                        JSON.stringify(res.body).should.equal(JSON.stringify(expectedItems));
                    }
                    done();
                });
        } else {
            agent.get(`/api/items/${id}/${supplierId}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    if (res.status == 200) {
                        JSON.stringify(res.body).should.equal(JSON.stringify(expectedItems));
                    }
                    done();
                });
        }
    });
}

function updateItem(expectedHTTPStatus, id, supplierId, newDescription, newPrice) {
    it('update an item', function (done) {
        if (newDescription !== undefined) {
            let item = { newDescription: newDescription, newPrice: newPrice }
            agent.put(`/api/item/${id}/${supplierId}`)
                .send(item)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/item/${id}/${supplierId}`) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
