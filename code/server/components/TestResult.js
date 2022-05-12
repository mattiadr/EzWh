class TestResult {
	constructor(id, idTestDescriptor, date, result, rfid) {
		this.id = id;
		this.idTestDescriptor = idTestDescriptor;
		this.date = date;
		this.result = result;
		this.rfid = rfid;
	}
}

exports.TestResult = TestResult;
