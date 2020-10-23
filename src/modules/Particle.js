export default class Particle {
	constructor () {
		this.__x = 0;
		this.__y = 0;
		this.deltaX = 0;
		this.deltaY = 0;
	}

	draw () {

	}

	set x (v) {
		this.deltaX = v - this.__x;
		this.__x = v;
	}

	set y (v) {
		this.deltaY = v - this.__y;
		this.__y = v;
	}

	get x () {
		return this.__x;
	}

	get y () {
		return this.__y;
	}
}