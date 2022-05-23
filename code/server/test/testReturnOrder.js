// noinspection DuplicatedCode

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const agent = chai.request.agent(app);


const restockOrders = [
	{
		"issueDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "qty": 30},
			{"SKUId": 2, "description": "another product", "price": 11.99, "qty": 20}
		],
		"supplierId": 1
	},
	{
		"issueDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 3, "description": "a product", "price": 10.99, "qty": 30},
			{"SKUId": 4, "description": "another product", "price": 11.99, "qty": 20}
		],
		"supplierId": 1
	},
];

const SKUs = [
	{
		"description": "a new sku",
		"weight": 100,
		"volume": 50,
		"notes": "first SKU",
		"availableQuantity": 1,
		"price": 10.99,
	},
	{
		"description": "another sku",
		"weight": 101,
		"volume": 60,
		"notes": "second SKU",
		"availableQuantity": 55,
		"price": 10.99,
	},
	{
		"description": "another another sku",
		"weight": 86,
		"volume": 15,
		"notes": "third SKU",
		"availableQuantity": 55,
		"price": 10.99,
	},
	{
		"description": "another another another sku",
		"weight": 86,
		"volume": 15,
		"notes": "third SKU",
		"availableQuantity": 55,
		"price": 10.99,
	},
];

const items = [
	{
		"id": 1,
		"description": "a product",
		"price": 10.99,
		"SKUId": 1,
		"supplierId": 1
	},
	{
		"id": 2,
		"description": "another product",
		"price": 11.99,
		"SKUId": 2,
		"supplierId": 1
	},
	{
		"id": 3,
		"description": "a product",
		"price": 10.99,
		"SKUId": 3,
		"supplierId": 1
	},
	{
		"id": 4,
		"description": "another product",
		"price": 11.99,
		"SKUId": 4,
		"supplierId": 1
	},
];

const returnOrders = [
	{
		"returnDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "RFID": "00000000000000000000000000000001"},
			{"SKUId": 2, "description": "another product", "price": 11.99, "RFID": "00000000000000000000000000000002"}
		],
		"restockOrderId": 1
	},
	{
		"returnDate": "2021/11/29 11:50",
		"products": [
			{"SKUId": 3, "description": "a product", "price": 10.99, "RFID": "00000000000000000000000000000003"},
			{"SKUId": 4, "description": "another product", "price": 11.99, "RFID": "00000000000000000000000000000004"}
		],
		"restockOrderId": 2
	}
];

const invalidReturnOrders = [
	{
		"returnDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "RFID": "00000000000000000000000000000001"},
			{"SKUId": 2, "description": "another product", "price": 11.99, "RFID": "00000000000000000000000000000002"}
		],
		"restockOrderId": 150
	},
	{
		"products": [
			{"SKUId": 3, "description": "a product", "price": 10.99, "RFID": "00000000000000000000000000000003"},
			{"SKUId": 4, "description": "another product", "price": 11.99, "RFID": "00000000000000000000000000000004"}
		],
		"restockOrderId": 2
	},
	{
		"returnDate": "Mon Nov 29 2021 12:30:00",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "RFID": "00000000000000000000000000000001"},
			{"SKUId": 2, "description": "another product", "price": 11.99, "RFID": "00000000000000000000000000000002"}
		],
		"restockOrderId": 1
	},
	{
		"returnDate": "2021/11/29 09:33",
		"products": [
			{"description": "a product", "price": 10.99, "RFID": "00000000000000000000000000000001"},
			{"SKUId": 2, "description": "another product", "price": 11.99}
		],
		"restockOrderId": 1
	},
];

// compareObject(actual, expected, {p1: type, p2: type}).should.be.true
// returns true if json objects match
function compareObject(actual, expected, shouldHave) {
	actual.should.be.an("object");
	for (let [p, t] of Object.entries(shouldHave)) {
		actual.should.haveOwnProperty(p);
		if (t) actual[p].should.be.a(t.toString());
	}
	return Object.entries(expected).every(([k, v]) => {
		try {
			actual[k].should.be.eql(v);
			return true;
		} catch (e) {
			return false;
		}
	});
}

// compareArray(actual, expected, {p1: type, p2: type}).should.be.true
// returns true if arrays match, ignoring order
function compareArray(actual, expected, shouldHave) {
	actual.should.be.an("array");
	actual.should.have.lengthOf(expected.length);
	return actual.every((ac) => expected.some((ex) => compareObject(ac, ex, shouldHave)));
}

function testCreateReturnOrder(returnOrder, expectedStatus) {
	it("POST /api/returnOrder", (done) => {
		agent.post("/api/returnOrder")
			.send(returnOrder)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					done();
				}
			});
	});
}

function testGetReturnOrders(expectedStatus, expectedReturnOrders) {
	it(`GET /api/returnOrders`, (done) => {
		agent.get(`/api/returnOrders`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareArray(res.body, expectedReturnOrders, {
							id: "number",
							returnDate: "string",
							restockOrderId: "number",
							products: "array",
						}).should.be.true;

						res.body.every((ac) => expectedReturnOrders.some((ex) => compareArray(ac.products, ex.products, {
							SKUId: "number",
							description: "string",
							price: "number",
							RFID: "string"
						}))).should.be.true;
					}
					done();
				}
			});
	});
}

function testGetReturnOrderByID(id, expectedStatus, expectedReturnOrder) {
	it(`GET /api/returnOrders/${id}`, (done) => {
		agent.get(`/api/returnOrders/${id}`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareObject(res.body, expectedReturnOrder, {
							id: "number",
							returnDate: "string",
							restockOrderId: "number",
							products: "array",
						}).should.be.true;

						compareArray(res.body.products, expectedReturnOrder.products, {
							SKUId: "number",
							description: "string",
							price: "number",
							RFID: "string"
						}).should.be.true;
					}
					done();
				}
			});
	});
}

function testDeleteReturnOrderByID(id, expectedStatus) {
	it(`DELETE /api/returnOrder/${id}`, (done) => {
		agent.delete(`/api/returnOrder/${id}`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					done();
				}
			});
	});
}

describe("Test ReturnOrder API", () => {
	/** INIT **/
	beforeEach(async () => {
		agent.post("/api/restockOrder").send(restockOrders[0]).end();
		agent.post("/api/restockOrder").send(restockOrders[1]).end();
		agent.post("/api/sku").send(SKUs[0]).end();
		agent.post("/api/sku").send(SKUs[1]).end();
		agent.post("/api/sku").send(SKUs[2]).end();
		agent.post("/api/sku").send(SKUs[3]).end();
		agent.post("/api/item").send(items[0]).end();
		agent.post("/api/item").send(items[1]).end();
		agent.post("/api/item").send(items[2]).end();
		agent.post("/api/item").send(items[3]).end();
	});

	/** POST **/
	describe("adding ReturnOrder", () => {
		testCreateReturnOrder(returnOrders[0], 201);
		testCreateReturnOrder(returnOrders[1], 201);
	});
	describe("adding invalid ReturnOrder", () => {
		testCreateReturnOrder(invalidReturnOrders[0], 404); // restock order not found
		testCreateReturnOrder(invalidReturnOrders[1], 422); // missing param
		testCreateReturnOrder(invalidReturnOrders[2], 422); // invalid date format
		testCreateReturnOrder(invalidReturnOrders[3], 422); // bad products
	});

	/** GET **/
	describe("getting ReturnOrder", () => {
		testGetReturnOrders(200, returnOrders);
		testGetReturnOrderByID(1, 200, returnOrders[0]);
		testGetReturnOrderByID(2, 200, returnOrders[1]);
	});
	describe("getting invalid ReturnOrder", () => {
		testGetReturnOrderByID(150, 404); // return order not found
		testGetReturnOrderByID("not a number", 422); // invalid id
	});

	/** DELETE **/
	describe("deleting ReturnOrder", () => {
		testDeleteReturnOrderByID(1, 204);
		testDeleteReturnOrderByID(2, 204);
	});
	describe("deleting invalid ReturnOrder", () => {
		testDeleteReturnOrderByID("not a number", 422); // invalid id
	});
});
