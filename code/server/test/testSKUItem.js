// noinspection DuplicatedCode

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const agent = chai.request.agent(app);


const postSKUs = [
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
];

const postSKUItems = [
	{
		"RFID": "12345678901234567890123456789014",
		"SKUId": 1,
		"DateOfStock": "2021/11/29 12:30",
	},
	{
		"RFID": "12345678901234567890123456789015",
		"SKUId": 1,
		"DateOfStock": "2021/11/29",
	},
	{
		"RFID": "12345678901234567890123456789016",
		"SKUId": 2,
		"DateOfStock": null,
	},
];

const invalidSKUItems = [
	{
		"RFID": "12345678901234567890123456789014",
		"SKUId": 150,
		"DateOfStock": "2021/11/29 12:30",
	},
	{
		"RFID": "12345678901234567890123456789015",
		"SKUId": 1,
		"DateOfStock": "Mon Nov 29 2021 12:30:00",
	},
];

const expectedSKUItems = [
	{
		"RFID": "12345678901234567890123456789014",
		"SKUId": 1,
		"Available": 1,
		"DateOfStock": "2021/11/29 12:30",
	},
	{
		"RFID": "12345678901234567890123456789015",
		"SKUId": 1,
		"Available": 0,
		"DateOfStock": "2021/11/29 00:00",
	},
	{
		"RFID": "12345678901234567890123456789016",
		"SKUId": 2,
		"Available": 0,
	},
];

const modifyBody = {
	"newRFID": "12345678901234567890123456789014",
	"newAvailable": 1,
	"newDateOfStock": "2021/11/29 12:30"
};

const invalidModifyBodies = [
	{
		"newRFID": "12345678901234567890123456789015",
		"newDateOfStock": "2021/11/29 12:30"
	},
	{
		"newRFID": "12345678901234567890123456789015",
		"newAvailable": 1,
		"newDateOfStock": "Mon Nov 29 2021 12:30:00"
	},
];

const modifiedSKUItem = {
	"RFID": "12345678901234567890123456789014",
	"SKUId": 1,
	"DateOfStock": "2021/11/29 12:30",
	"Available": 1,
};


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

function testCreateSKUItem(skuitem, expectedStatus) {
	it("POST /api/skuitem", (done) => {
		agent.post("/api/skuitem")
			.send(skuitem)
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

function testGetSKUItems(expectedStatus, expectedSKUItems) {
	it(`GET /api/skuitems`, (done) => {
		agent.get(`/api/skuitems`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareArray(res.body, expectedSKUItems, {
							RFID: null,
							SKUId: "number",
							Available: "number",
							DateOfStock: null,
						}).should.be.true;
					}
					done();
				}
			});
	});
}

function testGetSKUItemsBySKUID(id, expectedStatus, expectedSKUItems) {
	it(`GET /api/skuitems/sku/${id}`, (done) => {
		agent.get(`/api/skuitems/sku/${id}`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareArray(res.body, expectedSKUItems, {
							RFID: null,
							SKUId: "number",
							Available: "number",
							DateOfStock: null,
						}).should.be.true;
					}
					done();
				}
			});
	});
}

function testGetSKUItemByRFID(rfid, expectedStatus, expectedSKUItem) {
	it(`GET /api/skuitems/${rfid}`, (done) => {
		agent.get(`/api/skuitems/${rfid}`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareObject(res.body, expectedSKUItem, {
							RFID: null,
							SKUId: "number",
							Available: "number",
							DateOfStock: null,
						}).should.be.true;
					}
					done();
				}
			});
	});
}

function testModifySKUItemByRFID(rfid, body, expectedStatus) {
	it(`PUT /api/skuitems/${rfid}`, (done) => {
		agent.put(`/api/skuitems/${rfid}`)
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

function testDeleteSKUItemByRFID(rfid, expectedStatus) {
	it(`DELETE /api/skuitems/${rfid}`, (done) => {
		agent.delete(`/api/skuitems/${rfid}`)
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

describe("Test SKUItem API", () => {
	/** INIT **/
	before(async () => {
		await agent.delete("/api/resetDatabase");
		await agent.post("/api/sku").send(postSKUs[0]);
		await agent.post("/api/sku").send(postSKUs[1]);
		await agent.post("/api/sku").send(postSKUs[2]);
	});

	/** POST **/
	describe("adding SKUItem", () => {
		testCreateSKUItem(postSKUItems[0], 201);
		testCreateSKUItem(postSKUItems[1], 201);
		testCreateSKUItem(postSKUItems[2], 201);
	});
	describe("adding invalid SKUItem", () => {
		testCreateSKUItem(invalidSKUItems[0], 404); // SKU not found
		testCreateSKUItem(invalidSKUItems[1], 422); // invalid date format
	});

	/** PUT **/
	describe("modifying SKUItem", () => {
		testModifySKUItemByRFID("12345678901234567890123456789014", modifyBody, 200);
		testGetSKUItemByRFID("12345678901234567890123456789014", 200, modifiedSKUItem);
	});

	/** GET **/
	describe("getting SKUItem", () => {
		testGetSKUItems(200, expectedSKUItems);
		testGetSKUItemsBySKUID(1, 200, [expectedSKUItems[0]]);
		testGetSKUItemsBySKUID(3, 200, []); // sku exists but there are no skuitems associated (not an error!)
		testGetSKUItemByRFID("12345678901234567890123456789014", 200, expectedSKUItems[0]);
	});
	describe("getting invalid SKUItem", () => {
		testGetSKUItemsBySKUID(120, 404); // SKU not found
		testGetSKUItemsBySKUID("a string", 422); // invalid SKUid
		testGetSKUItemByRFID("12345678901234567890123456789030", 404); // SKUItem not found
		testGetSKUItemByRFID("not a valid id", 422); // invalid rfid
	});

	describe("modifying invalid SKUItem", () => {
		testModifySKUItemByRFID("12345678901234567890123456789030", modifyBody, 404); // rfid not found
		testModifySKUItemByRFID("12345678901234567890123456789015", invalidModifyBodies[0], 422); // missing param
		testModifySKUItemByRFID("12345678901234567890123456789015", invalidModifyBodies[1], 422); // invalid date format
	});

	/** DELETE **/
	describe("deleting SKUItem", () => {
		testDeleteSKUItemByRFID("12345678901234567890123456789014", 204);
		testDeleteSKUItemByRFID("12345678901234567890123456789015", 204);
	});
	describe("deleting invalid SKUItem", () => {
		testDeleteSKUItemByRFID("not a valid id", 422);
	});
});
