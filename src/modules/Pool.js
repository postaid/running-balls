export default class Pool {
	constructor(objClass) {
		this.__objClass = objClass;
		this.__pool = [];
		this.onCreate = null;
	}

	load(count) {
		while (count-- > 0) {
			this.__pool.push(this.__createObject());
		}
	}

	put(o) {
		this.__pool.push(o);
	}

	get() {
		if (this.__pool.length) {
			return this.__pool.pop();
		}
		return this.__createObject();
	}

	__createObject () {
		const obj = new this.__objClass();
		if (this.onCreate) {
			this.onCreate(obj);
		}
		return obj;
	}
}