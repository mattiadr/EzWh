class TestDescriptor {
	#id; #name; #procedureDescription; #idSKU;

	constructor(id, name, procedureDescription, idSKU) {
		this.#id = id;
		this.#name = name;
		this.#procedureDescription = procedureDescription;
		this.#idSKU = idSKU;
		this.#name = name;
		this.#procedureDescription = procedureDescription;
		this.#idSKU = idSKU;
	}

	get id() { return this.#id; }
	get name() { return this.#name; }
	get procedureDescription() { return this.#procedureDescription; }
	get idSKU() { return this.#idSKU; }

	set name(value) { this.#name = value; }
	set procedureDescription(value) { this.#procedureDescription = value; }
	set idSKU(value) { this.#idSKU = value; }
}

exports.TestDescriptor = TestDescriptor;
