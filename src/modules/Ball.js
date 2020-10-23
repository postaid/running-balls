import Particle from "./Particle";

export default class Ball extends Particle {
	constructor() {
		super();
		this.sin = 0;
		this.cos = 0;
		this.duration = 1000;
	}

	draw(ctx) {
		ctx.moveTo(this.x, this.y);
		ctx.arc(this.x, this.y, Ball.R2, 0, Math.PI * 2);
	}
}

Ball.R2 = 7;
