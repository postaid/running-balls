import React from 'react';
import './RunningCircle.css';
import Pool from './modules/Pool';
import Ball from './modules/Ball';
import { vec2 } from 'gl-matrix'
import { queueFunction } from './modules/utils'

export default class RunningCircle extends React.Component {
	constructor (props) {
		super(props);
		this.state = { count: 0, showLines: false, delay: 10, autoDelay: true };
		this.refCanvasBG = React.createRef();
		this.refCanvasCircles = React.createRef();
		this.__handlerShowLines = this.showLines.bind(this);
		this.__handlerDelay = this.setDelay.bind(this);
		this.__handlerAutoDelay = this.setAutoDelay.bind(this);

		this.__ctx = null;
	}

	render () {

		const setVal = [0, 1, 5, 10].map((v) => <button key={v} onClick={this.setCount.bind(this, v)}>{v}</button>);
		const addVal = [2, 1, -1, -2].map((v) => <button key={v}
		                                                 onClick={this.addCircle.bind(this, v)}>{v > 0 ? '+' : ''}{v}</button>);
		return (
			<div style={{ userSelect: 'none', width: '600px' }}>
				{this.state.count}
				<div style={{ position: 'relative', width: '600px', height: '600px' }}>
					<canvas ref={this.refCanvasBG} className="canvas-draw"/>
					<canvas ref={this.refCanvasCircles} className="canvas-draw"/>
				</div>
				{setVal}
				{addVal}
				<label><input type="checkbox" onChange={this.__handlerShowLines}/>Show lines</label>
				<br/>
				Shift x5; Ctrl x10; Ctrl + Shift x50
				<br/>
				<label><input type="checkbox" onChange={this.__handlerAutoDelay} checked={this.state.autoDelay}/>Auto
					delay</label>
				<br/>
				<input type="range" min={0} max={1000} value={this.state.delay} disabled={this.state.autoDelay}
				       onInput={this.__handlerDelay} style={{ width: '600px' }}/>{this.state.delay}
			</div>
		);
	}

	componentDidMount () {
		[
			this.refCanvasBG.current,
			this.refCanvasCircles.current,
		].forEach(initCanvases);

		drawBackground(this.refCanvasBG.current);
		this.__ctx = this.refCanvasCircles.current.getContext('2d');
		this.__ctx.translate(300, 300);
		this.__pool = new Pool(Ball);
		this.__pool.onCreate = (ball) => {
			ball.pos = ball.goal = vec2.fromValues(-R + R2, -R + R2);
		};
		this.__pool.load(300);
		this.__time = Date.now();
		this.__draw();
	}

	componentDidUpdate (prevProps, prevState, snapshot) {
		let setAppear = false;
		let time = Date.now();
		let count = this.state.count;
		ballsCount = count;
		let prevCount = prevState.count;
		let deltaCount = count - prevCount;
		if (deltaCount) {
			if (deltaCount > 0) {
				let i;
				for (i = 0; i < deltaCount && prevCount + i < balls.length; i++) {
					balls[prevCount + i].remove = false;
				}
				deltaCount -= i;
				while (deltaCount--) {
					addBall(this.__pool, time);
				}
			} else {
				while (deltaCount++) {
					disappear(balls[prevCount + deltaCount - 1], time, this.__time);
				}
			}
			setAppear = true;
		}
		if (this.state.autoDelay !== prevState.autoDelay) {
			setAppear = true;
		}
		// if (this.state.delay !== prevState.delay) {
		// 	setAppear = true;
		// }
		if (setAppear) {
			updateBallsTrigonometry(this.state.autoDelay, this.state.delay);
			for (let i = 0; i < count; i++) {
				appear(balls[i], time, this.__time);
			}
		}
	}

	__draw () {
		let time = Date.now();
		let dTime = time - this.__time;

		let count = this.state.count;
		let showLines = this.state.showLines;
		let autoDelay = this.state.autoDelay;
		let delay = autoDelay ? DURATION / ballsCount / 2 : this.state.delay;
		let ctx = this.__ctx;

		ctx.clearRect(-300, -300, 600, 600);

		ctx.strokeWidth = 2;
		ctx.strokeStyle = 'rgba(255,255,255,0.8)';
		if (showLines) {
			drawLines(ctx, count);
		}
		ctx.fillStyle = 'white';
		drawCircles(ctx, dTime, delay, time);

		requestAnimationFrame(() => this.__draw());
	}

	addCircle (delta, ev) {
		if (ev.shiftKey) {
			delta *= 5;
		}
		if (ev.ctrlKey) {
			delta *= 10;
		}

		this.setState({ count: Math.max(0, this.state.count + delta) });
	}

	showLines (ev) {
		this.setState({ showLines: ev.target.checked });
	}

	setDelay (ev) {
		this.setState({ delay: +ev.target.value });
	}

	setAutoDelay (ev) {
		this.setState({ autoDelay: ev.target.checked });
	}

	setCount (count) {
		this.setState({ count: Math.min(Math.max(0, count), MAX_BALLS) });
	}
}

const SIZE = [600, 600];
const R = 300;
const R2 = Ball.R2;
const DURATION = 4000;
const MAX_LINES = 1000;
const MAX_BALLS = Infinity;
let balls = [];
let ballsCount = 0;

function initCanvases (canvas) {
	canvas.style.width = (canvas.width = SIZE[0]) + 'px';
	canvas.style.height = (canvas.height = SIZE[1]) + 'px';
}

function drawBackground (canvas) {
	let ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.fillStyle = '#CF0002';
	ctx.arc(R, R, R, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = 'rgba(255,255,255,0.5)';
	ctx.moveTo(-R + R2, -R + R2);
	ctx.arc(R2, R2, R2, 0, Math.PI * 2);
	ctx.fill();
}

function drawLines (ctx, count) {
	let a = Math.PI / count;
	let inc = 1;
	if (count > MAX_LINES) {
		inc = count / MAX_LINES;
	}

	ctx.beginPath();
	for (let i = 1; i <= count; i += inc) {
		let x = R * Math.cos(a * i);
		let y = R * Math.sin(a * i);

		ctx.moveTo(-x, -y);
		ctx.lineTo(x, y);
	}
	ctx.stroke();
}

function drawCircles (ctx, time, delay, fullTime) {
	let dist = R - R2;
	let b = balls;
	ctx.beginPath();
	for (let i = 0; i < b.length; i++) {
		let ball = b[i];
		ball.delay = delay * i;
		let d = animate(dist, time + ball.delay);
		ball.goal = vec2.scale(vec2.create(), ball.trigon, d);
		ball.animate(fullTime);

		ball.draw(ctx);
	}
	ctx.fill();
}

function animate (dist, time) {
	let rest = time % DURATION;
	let part = rest / DURATION;
	return dist * Math.cos(2 * Math.PI * part);
}

function addBall (pool, time, delay) {
	const ball = pool.get();
	ball.remove = false;
	ball.delay = delay;
	ball.animate = defaultAnimate;
	balls.push(ball);
}

function appear (ball, time, startTime) {
	let dist = R - R2;
	let t = time - startTime + ball.duration;
	let d = animate(dist, t + ball.delay);

	ball.t0 = time;
	ball.pos0 = vec2.clone(ball.pos);
	ball.posTarget = vec2.scale(vec2.create(), ball.trigon, d)
	ball.animate = appearAnimate;
}

function disappear (ball, time) {
	ball.t0 = time;
	ball.pos0 = vec2.clone(ball.pos);
	ball.posTarget = vec2.fromValues(-R + R2, -R + R2);
	let delta = vec2.clone(ball.delta);
	if (delta[0] === 0) delta[0] = 1;
	if (delta[1] === 0) delta[1] = 1;
	let posDelta = vec2.add(vec2.create(), vec2.scale(vec2.create(), delta, 50), ball.pos0);
	if (posDelta[0] < ball.posTarget[0]) {
		posDelta[1] *= (ball.posTarget[0] - ball.pos0[0]) / (posDelta[0] - ball.pos0[0])
		posDelta[0] = ball.posTarget[0];
	}
	if (posDelta[1] < ball.posTarget[1]) {
		posDelta[0] *= (ball.posTarget[1] - ball.pos0[1]) / (posDelta[1] - ball.pos0[1])
		posDelta[1] = ball.posTarget[1];
	}
	ball.posDelta = posDelta;
	ball.animate = animateDisappear;
}

function animateDisappear (time) {
	if (time > this.t0 + this.duration / 2) {
		this.pos = this.posTarget;
		this.remove = true;
		queueFunction(removeMarkesBalls);
		return;
	}

	let part = (time - this.t0) / (this.duration / 2);
	this.pos = quadraticBesierPoint(this.pos0, this.posDelta, this.posTarget, part);
}

function defaultAnimate () {
	this.pos = this.goal;
}

function appearAnimate (time) {
	if (time > this.t0 + this.duration) {
		this.animate = defaultAnimate;
		this.animate(time);
		return;
	}


	let part = (time - this.t0) / this.duration;
	this.pos = cosInterplation(this.pos0, this.posTarget, part);
}

function cosInterplation (v0, v1, p) {
	let v = vec2.create();
	return vec2.add(v, v0, vec2.scale(v, vec2.subtract(v, v1, v0), Math.sin(Math.PI * p / 2)));
}

function updateBallsTrigonometry (autoDelay, delay) {
	let ln = ballsCount;
	delay = autoDelay ? DURATION / ln / 2 : delay;
	let a = Math.PI / ln;
	for (let i = 0; i < ln; i++) {
		const ball = balls[i];
		ball.delay = delay * i;
		ball.trigon = vec2.fromValues(Math.cos(a * i), Math.sin(a * i));
	}
}

function removeMarkesBalls () {
	balls = balls.filter(b => !b.remove);
}

function quadraticBesierPoint (p1, p2, p3, t) {
	// P = (1−t)^2 * P1 + 2*(1−t)*t*P2 + t^2 * P3
	let t1 = 1 - t;
	return v2AddAll(vec2.create(),
		vec2.scale(vec2.create(), p1, t1 * t1),
		vec2.scale(vec2.create(), p2, 2 * t1 * t),
		vec2.scale(vec2.create(), p3, t * t),
	);
}

function v2AddAll (out, v, ...vecs) {
	if (vecs.length === 1) {
		return vec2.add(out, v, vecs[0]);
	}
	return vec2.add(out, v, v2AddAll(out, ...vecs));
}



