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

const invalidSKUs = [
	{
		"description": "a new sku",
		"weight": 100,
		"volume": 50,
		"price": 10.99,
	},
	{
		"description": "another sku",
		"weight": "a string",
		"volume": 60,
		"notes": "second SKU",
		"availableQuantity": 55,
		"price": 10.99,
	},
]

const expectedSKUs = [
	{
		"description": "a new sku",
		"weight": 100,
		"volume": 50,
		"notes": "first SKU",
		"availableQuantity": 1,
		"price": 10.99,
		"testDescriptors": [],
	},
	{
		"description": "another sku",
		"weight": 101,
		"volume": 60,
		"notes": "second SKU",
		"availableQuantity": 55,
		"price": 10.99,
		"testDescriptors": [],
	},
	{
		"description": "another another sku",
		"weight": 86,
		"volume": 15,
		"notes": "third SKU",
		"availableQuantity": 55,
		"price": 10.99,
		"testDescriptors": [],
	},
];

const modifyBody = {
	"newDescription": "a modified sku",
	"newWeight": 63,
	"newVolume": 48,
	"newNotes": "first SKU",
	"newPrice": 10.99,
	"newAvailableQuantity": 50,
}

const invalidModifyBodies = [
	{
		"newDescription": "a modified sku",
	},
	{
		"newDescription": "a modified sku",
		"newWeight": 50000,
		"newVolume": 50000,
		"newNotes": "first SKU",
		"newPrice": 10.99,
		"newAvailableQuantity": 50000,
	}
];

const modifiedSKU = {
	"description": "a modified sku",
	"weight": 63,
	"volume": 48,
	"notes": "first SKU",
	"availableQuantity": 50,
	"price": 10.99,
	"testDescriptors": [],
}

const position = [
	{
		"positionID": "111122223333",
		"aisleID": "1111",
		"row": "2222",
		"col": "3333",
		"maxWeight": 100000,
		"maxVolume": 100000,
	},
	{
		"positionID": "111122224444",
		"aisleID": "1111",
		"row": "2222",
		"col": "4444",
		"maxWeight": 100000,
		"maxVolume": 100000,
	},
];

const positionSKU = {
	"description": "a new sku",
	"weight": 100,
	"volume": 50,
	"notes": "first SKU",
	"availableQuantity": 1,
	"price": 10.99,
	"testDescriptors": [],
	"position": "111122223333",
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

function testCreateSKU(sku, expectedStatus) {
	it("POST /api/sku", (done) => {
		agent.post("/api/sku")
			.send(sku)
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

function testGetSKUs(expectedStatus, expectedSKUs) {
	it(`GET /api/skus`, (done) => {
		agent.get(`/api/skus`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareArray(res.body, expectedSKUs, {
							id: "number",
							description: "string",
							weight: "number",
							volume: "number",
							notes: "string",
							availableQuantity: "number",
							price: "number",
							testDescriptors: "array"
						}).should.be.true;
					}
					done();
				}
			});
	});
}

function testGetSKUbyID(id, expectedStatus, expectedSKU) {
	it(`GET /api/skus/${id}`, (done) => {
		agent.get(`/api/skus/${id}`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareObject(res.body, expectedSKU, {
							id: "number",
							description: "string",
							weight: "number",
							volume: "number",
							notes: "string",
							availableQuantity: "number",
							price: "number",
							testDescriptors: "array"
						}).should.be.true;
					}
					done();
				}
			});
	});
}

function testModifySKU(id, body, expectedStatus) {
	it(`PUT /api/sku/${id}`, (done) => {
		agent.put(`/api/sku/${id}`)
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

function testModifySKUPosition(id, body, expectedStatus) {
	it(`PUT /api/sku/${id}/position`, (done) => {
		agent.put(`/api/sku/${id}/position`)
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

function testDeleteSKUbyID(id, expectedStatus) {
	it(`DELETE /api/skus/${id}`, (done) => {
		agent.delete(`/api/skus/${id}`)
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

describe("Test SKU API", () => {
	/** POST **/
	describe("adding SKU", () => {
		testCreateSKU(postSKUs[0], 201);
		testCreateSKU(postSKUs[1], 201);
		testCreateSKU(postSKUs[2], 201);
	});
	describe("adding invalid SKU", () => {
		testCreateSKU(invalidSKUs[0], 422);
		testCreateSKU(invalidSKUs[1], 422);
	});

	/** GET **/
	describe("getting SKU", () => {
		testGetSKUs(200, expectedSKUs);
		testGetSKUbyID(1, 200, expectedSKUs[0]);
		testGetSKUbyID(2, 200, expectedSKUs[1]);
	});
	describe("getting invalid SKU", () => {
		testGetSKUbyID(6, 404); // sku not found
		testGetSKUbyID("not a number", 422); // invalid id
	});

	/** PUT **/
	describe("modifying SKU position", () => {
		agent.post("/api/position").send(position[0]).end();
		testModifySKUPosition(1, {position: position[0].positionID}, 200);
		testGetSKUbyID(1, 200, positionSKU);
	});
	describe("modifying invalid SKU position", () => {
		agent.post("/api/position").send(position[1]).end();
		testModifySKUPosition(6, {position: position[1].positionID}, 404); // sku not found
		testModifySKUPosition(2, {position: 123412341234}, 404); // position not found
		testModifySKUPosition(2, {position: position[0].positionID}, 422); // position already assigned
	});
	describe("modifying SKU", () => {
		testModifySKU(1, modifyBody, 200);
		testGetSKUbyID(1, 200, modifiedSKU);
	});
	describe("modifying invalid SKU", () => {
		testModifySKU(56, modifyBody, 404); // sku not found
		testModifySKU(1, invalidModifyBodies[0], 422); // missing params
		testModifySKU(1, invalidModifyBodies[1], 422); // does not respect weight and space limit
	});

	/** DELETE **/
	describe("deleting SKU", () => {
		testDeleteSKUbyID(2, 204);
		testDeleteSKUbyID(3, 204);
	});
	describe("deleting invalid SKU", () => {
		testDeleteSKUbyID("not a number", 422); // invalid id
	});
});
