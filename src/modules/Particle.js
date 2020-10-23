import { vec2 } from 'gl-matrix';

export default class Particle {
	constructor () {
		this.__pos = vec2.create();
		this.delta = vec2.create();
	}

	draw () {

	}

	set pos (v) {
		this.delta = vec2.subtract(vec2.create(), v, this.__pos);
		this.__pos = v;
	}

	get pos () {
		return this.__pos;
	}
}
