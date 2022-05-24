// noinspection DuplicatedCode

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const agent = chai.request.agent(app);


const postInternalOrders = [
	{
		"issueDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "qty": 3},
			{"SKUId": 2, "description": "another product", "price": 11.99, "qty": 3}
		],
		"customerId": 1
	},
	{
		"issueDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 3, "description": "again, a product", "price": 10.99, "qty": 3},
			{"SKUId": 4, "description": "again, another product", "price": 11.99, "qty": 3}
		],
		"customerId": 1
	},
	{
		"issueDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 5, "description": "once again, a product", "price": 10.99, "qty": 3},
			{"SKUId": 6, "description": "once again, another product", "price": 11.99, "qty": 3}
		],
		"customerId": 2
	},
];

const invalidInternalOrders = [
	{
		"issueDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "qty": 3},
			{"SKUId": 2, "description": "another product", "price": 11.99, "qty": 3}
		],
	},
	{
		"issueDate": "Mon Nov 29 2021 12:30:00",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "qty": 3},
			{"SKUId": 2, "description": "another product", "price": 11.99, "qty": 3}
		],
		"customerId": 1
	},
	{
		"issueDate": "2021/11/29 09:33",
		"products": [
			{"SKUId": 1, "description": "a product", "qty": 3},
			{"description": "another product", "price": 11.99, "qty": 3}
		],
		"customerId": 1
	},
];

const expectedInternalOrder = [
	{
		"id": 1,
		"issueDate": "2021/11/29 09:33",
		"state": "ISSUED",
		"products": [
			{"SKUId": 1, "description": "a product", "price": 10.99, "qty": 3},
			{"SKUId": 2, "description": "another product", "price": 11.99, "qty": 3}
		],
		"customerId": 1
	},
	{
		"id": 2,
		"issueDate": "2021/11/29 09:33",
		"state": "ACCEPTED",
		"products": [
			{"SKUId": 3, "description": "again, a product", "price": 10.99, "qty": 3},
			{"SKUId": 4, "description": "again, another product", "price": 11.99, "qty": 3}
		],
		"customerId": 1
	},
	{
		"id": 3,
		"issueDate": "2021/11/29 09:33",
		"state": "COMPLETED",
		"products": [
			{
				"SKUId": 5,
				"description": "once again, a product",
				"price": 10.99,
				"RFID": "00000000000000000000000000000001"
			},
			{
				"SKUId": 6,
				"description": "once again, another product",
				"price": 11.99,
				"RFID": "00000000000000000000000000000002"
			}
		],
		"customerId": 2
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
		"description": "again, a product",
		"price": 10.99,
		"SKUId": 3,
		"supplierId": 1
	},
	{
		"id": 4,
		"description": "again, another product",
		"price": 11.99,
		"SKUId": 4,
		"supplierId": 1
	},
	{
		"id": 5,
		"description": "once again, a product",
		"price": 10.99,
		"SKUId": 5,
		"supplierId": 1
	},
	{
		"id": 6,
		"description": "once again, another product",
		"price": 11.99,
		"SKUId": 6,
		"supplierId": 1
	},
];

const modifyBodies = [
	{
		"newState": "ACCEPTED"
	},
	{
		"newState": "COMPLETED",
		"products": [
			{"SkuID": 5, "RFID": "00000000000000000000000000000001"},
			{"SkuID": 6, "RFID": "00000000000000000000000000000002"},
		]
	}
];

const invalidModifyBodies = [
	{
		"newState": "NOT A VALID STATE"
	},
	{
		"newState": "COMPLETED",
	},
	{
		"newState": "COMPLETED",
		"products": [
			{"RFID": "00000000000000000000000000000001"},
			{"SkuID": 6},
		]
	}
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

function testCreateInternalOrder(internalOrder, expectedStatus) {
	it("POST /api/internalOrders", (done) => {
		agent.post("/api/internalOrders")
			.send(internalOrder)
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

function testGetInternalOrders(endpoint, expectedStatus, expectedInternalOrders) {
	it(`GET /api/${endpoint}`, (done) => {
		agent.get(`/api/${endpoint}`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareArray(res.body, expectedInternalOrders, {
							id: "number",
							issueDate: "string",
							state: "string",
							customerId: "number",
							products: "array",
						}).should.be.true;

						res.body.every((ac) => expectedInternalOrders.some((ex) => compareArray(ac.products, ex.products, {
							SKUId: "number",
							description: "string",
							price: "number",
						}))).should.be.true;
					}
					done();
				}
			});
	});
}

function testGetInternalOrderByID(id, shouldHaveRFID, expectedStatus, expectedInternalOrder) {
	it(`GET /api/internalOrders/${id}`, (done) => {
		agent.get(`/api/internalOrders/${id}`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareObject(res.body, expectedInternalOrder, {
							id: "number",
							issueDate: "string",
							state: "string",
							customerId: "number",
							products: "array",
						}).should.be.true;

						const shouldHave = {
							SKUId: "number",
							description: "string",
							price: "number",
						};
						if (shouldHaveRFID) shouldHave.RFID = "string";
						compareArray(res.body.products, expectedInternalOrder.products, shouldHave).should.be.true;
					}
					done();
				}
			});
	});
}

function testModifyInternalOrder(id, body, expectedStatus) {
	it(`PUT /api/internalOrders/${id}`, (done) => {
		agent.put(`/api/internalOrders/${id}`)
			.send(body)
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

function testDeleteInternalOrderByID(id, expectedStatus) {
	it(`DELETE /api/internalOrders/${id}`, (done) => {
		agent.delete(`/api/internalOrders/${id}`)
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

describe("Test InternalOrder API", () => {
	/** INIT **/
	before(async () => {
		await agent.delete("/api/resetDatabase");
		await agent.post("/api/sku").send(SKUs[0]);
		await agent.post("/api/sku").send(SKUs[1]);
		await agent.post("/api/sku").send(SKUs[2]);
		await agent.post("/api/sku").send(SKUs[3]);
		await agent.post("/api/sku").send(SKUs[4]);
		await agent.post("/api/sku").send(SKUs[5]);
		await agent.post("/api/item").send(items[0]);
		await agent.post("/api/item").send(items[1]);
		await agent.post("/api/item").send(items[2]);
		await agent.post("/api/item").send(items[3]);
		await agent.post("/api/item").send(items[4]);
		await agent.post("/api/item").send(items[5]);
	});

	/** POST **/
	describe("adding InternalOrder", () => {
		testCreateInternalOrder(postInternalOrders[0], 201);
		testCreateInternalOrder(postInternalOrders[1], 201);
		testCreateInternalOrder(postInternalOrders[2], 201);
	});
	describe("adding invalid InternalOrder", () => {
		testCreateInternalOrder(invalidInternalOrders[0], 422); // missing param
		testCreateInternalOrder(invalidInternalOrders[1], 422); // invalid date format
		testCreateInternalOrder(invalidInternalOrders[2], 422); // bad products
	});

	/** PUT **/
	describe("modifying InternalOrder", () => {
		testModifyInternalOrder(2, modifyBodies[0], 200);
		testModifyInternalOrder(3, modifyBodies[1], 200);
	});
	describe("modifying invalid InternalOrder", () => {
		testModifyInternalOrder(101, modifyBodies[0], 404); // internal order not found
		testModifyInternalOrder("not a number", modifyBodies[0], 422); // invalid id
		testModifyInternalOrder(1, invalidModifyBodies[0], 422); // invalid state
		testModifyInternalOrder(1, invalidModifyBodies[1], 422); // missing products
		testModifyInternalOrder(1, invalidModifyBodies[2], 422); // bad products
	});

	/** GET **/
	describe("getting InternalOrder", () => {
		testGetInternalOrders("internalOrders", 200, expectedInternalOrder);
		testGetInternalOrders("internalOrdersIssued", 200, [expectedInternalOrder[0]]);
		testGetInternalOrders("internalOrdersAccepted", 200, [expectedInternalOrder[1]]);
		testGetInternalOrderByID(1, false, 200, expectedInternalOrder[0]);
		testGetInternalOrderByID(2, false, 200, expectedInternalOrder[1]);
		testGetInternalOrderByID(3, true, 200, expectedInternalOrder[2]);
	});
	describe("getting invalid InternalOrder", () => {
		testGetInternalOrderByID(150, false, 404); // internal order not found
		testGetInternalOrderByID("not a number", false, 422); // invalid id
	});

	/** DELETE **/
	describe("deleting InternalOrder", () => {
		testDeleteInternalOrderByID(1, 204);
		testDeleteInternalOrderByID(2, 204);
	});
	describe("deleting invalid InternalOrder", () => {
		testDeleteInternalOrderByID("not a number", 422); // invalid id
	});
});
