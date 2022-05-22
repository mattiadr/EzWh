// noinspection DuplicatedCode

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const agent = chai.request.agent(app);


const postPositions = [
	{
		"positionID": "111122223333",
		"aisleID": "1111",
		"row": "2222",
		"col": "3333",
		"maxWeight": 1000,
		"maxVolume": 1000,
	},
	{
		"positionID": "999988887777",
		"aisleID": "9999",
		"row": "8888",
		"col": "7777",
		"maxWeight": 1000,
		"maxVolume": 1000,
	}
];

const invalidPositions = [
	{
		"positionID": "111122223333",
		"aisleID": "1111",
		"row": "2222",
		"col": "3333",
		"maxWeight": "a string",
		"maxVolume": 1000,
	},
	{
		"positionID": "999966667777",
		"aisleID": "9999",
		"row": "8888",
		"col": "7777",
		"maxWeight": 1000,
		"maxVolume": 1000,
	}
];

const expectedPositions = [
	{
		"positionID": "111122223333",
		"aisleID": "1111",
		"row": "2222",
		"col": "3333",
		"maxWeight": 1000,
		"maxVolume": 1000,
		"occupiedWeight": 0,
		"occupiedVolume": 0,
	},
	{
		"positionID": "999988887777",
		"aisleID": "9999",
		"row": "8888",
		"col": "7777",
		"maxWeight": 1000,
		"maxVolume": 1000,
		"occupiedWeight": 0,
		"occupiedVolume": 0,
	}
];

const modifyBody = {
	"newAisleID": "4444",
	"newRow": "5555",
	"newCol": "6666",
	"newMaxWeight": 1200,
	"newMaxVolume": 600,
	"newOccupiedWeight": 200,
	"newOccupiedVolume": 100
};

const modifiedPositions = [
	{
		"positionID": "444455556666",
		"aisleID": "4444",
		"row": "5555",
		"col": "6666",
		"maxWeight": 1200,
		"maxVolume": 600,
		"occupiedWeight": 200,
		"occupiedVolume": 100,
	},
	{
		"positionID": "000011110000",
		"aisleID": "0000",
		"row": "1111",
		"col": "0000",
		"maxWeight": 1000,
		"maxVolume": 1000,
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

function testCreatePosition(position, expectedStatus) {
	it("POST /api/position", (done) => {
		agent.post("/api/position")
			.send(position)
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

function testGetPositions(expectedStatus, expectedPositions) {
	it(`GET /api/positions`, (done) => {
		agent.get(`/api/positions`)
			.end((err, res) => {
				if (err) {
					done(err);
				} else {
					res.should.have.status(expectedStatus);
					if (expectedStatus === 200) {
						res.should.be.json;
						compareArray(res.body, expectedPositions, {
							positionID: null,
							aisleID: null,
							row: null,
							col: null,
							maxWeight: "number",
							maxVolume: "number",
							occupiedWeight: "number",
							occupiedVolume: "number",
						}).should.be.true;
					}
					done();
				}
			});
	});
}

function testModifyPosition(id, body, expectedStatus) {
	it(`PUT /api/position/${id}`, (done) => {
		agent.put(`/api/position/${id}`)
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

function testModifyPositionID(id, body, expectedStatus) {
	it(`PUT /api/position/${id}/changeID`, (done) => {
		agent.put(`/api/position/${id}/changeID`)
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

function testDeletePositionByID(id, expectedStatus) {
	it(`DELETE /api/position/${id}`, (done) => {
		agent.delete(`/api/position/${id}`)
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

describe("Test Position API", () => {
	/** POST **/
	describe("adding position", () => {
		testCreatePosition(postPositions[0], 201);
		testCreatePosition(postPositions[1], 201);
	});
	describe("adding invalid position", () => {
		testCreatePosition(invalidPositions[0], 422); // passed string instead of int
		testCreatePosition(invalidPositions[1], 422); // id does not match aisle, row, col
	});

	/** GET **/
	describe("getting position", () => {
		testGetPositions(200, expectedPositions);
	});

	/** PUT **/
	describe("modifying position", () => {
		testModifyPosition("111122223333", modifyBody, 200);
		testModifyPositionID("999988887777", {"newPositionID": "000011110000"}, 200);
		testGetPositions(200, modifiedPositions);
	});
	describe("modifying invalid position", () => {
		testModifyPosition("000", modifyBody, 422); // invalid id
		testModifyPosition("a string", modifyBody, 422); // invalid id
		testModifyPosition("123456789012", modifyBody, 404); // id not found
		testModifyPosition("000011110000", {}, 422); // invalid body
	});

	/** DELETE **/
	describe("deleting position", () => {
		testDeletePositionByID("000011110000", 204);
	});
	describe("deleting invalid position", () => {
		testDeletePositionByID("000", 422); // invalid id
		testDeletePositionByID("a string", 422); // invalid id
	})
});
