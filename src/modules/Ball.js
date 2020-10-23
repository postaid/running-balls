import Particle from "./Particle";
import { vec2 } from 'gl-matrix'

export default class Ball extends Particle {
	constructor() {
		super();
		this.trigon = vec2.create();
		this.duration = 1000;
	}

	draw(ctx) {
		let pos = this.pos;
		ctx.moveTo(pos[0], pos[1]);
		ctx.arc(pos[0], pos[1], Ball.R2, 0, Math.PI * 2);
	}
}

Ball.R2 = 7;
