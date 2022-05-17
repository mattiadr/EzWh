class TestResult {
	#id; #idTestDescriptor; #date; #result; #rfid;

	constructor(id, idTestDescriptor, date, result, rfid) {
		this.#id = id;
		this.#idTestDescriptor = idTestDescriptor;
		this.#date = date;
		this.#result = result;
		this.#rfid = rfid;
		this.#idTestDescriptor = idTestDescriptor;
		this.#date = date;
		this.#result = result;
	}

	get id() { return this.#id; }
	get idTestDescriptor() { return this.#idTestDescriptor; }
	get date() { return this.#date; }
	get result() { return this.#result; }
	get rfid() { return this.#rfid; }

	set idTestDescriptor(value) { this.#idTestDescriptor = value; }
	set date(value) { this.#date = value; }
	set result(value) { this.#result = value; }
}

exports.TestResult = TestResult;
