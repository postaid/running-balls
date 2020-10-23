import React from 'react';
import './RunningCircle.css';
import Pool from './modules/Pool';
import Ball from './modules/Ball';

export default class RunningCircle extends React.Component {
	constructor(props) {
		super(props);
		this.state = {count: 0, showLines: false, delay: 10, autoDelay: true};
		this.refCanvasBG = React.createRef();
		this.refCanvasCircles = React.createRef();
		this.__handlerShowLines = this.showLines.bind(this);
		this.__handlerDelay = this.setDelay.bind(this);
		this.__handlerAutoDelay = this.setAutoDelay.bind(this);

		this.__ctx = null;
	}

	render() {

		const setVal = [0, 1, 5, 10].map((v) => <button key={v} onClick={this.setCount.bind(this, v)}>{v}</button>);
		const addVal = [2, 1, -1, -2].map((v) => <button key={v}
		                                                 onClick={this.addCircle.bind(this, v)}>{v > 0 ? '+' : ''}{v}</button>);
		return (
			<div style={{userSelect: 'none', width: '600px'}}>
				{this.state.count}
				<div style={{position: 'relative', width: '600px', height: '600px'}}>
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
				       onInput={this.__handlerDelay} style={{width: '600px'}}/>{this.state.delay}
			</div>
		);
	}

	componentDidMount() {
		[
			this.refCanvasBG.current,
			this.refCanvasCircles.current,
		].forEach(initCanvases);

		drawBackground(this.refCanvasBG.current);
		this.__ctx = this.refCanvasCircles.current.getContext('2d');
		this.__ctx.translate(300, 300);
		this.__pool = new Pool(Ball);
		this.__pool.onCreate = (ball) => {
			ball.x = ball.goalX = -R + R2;
			ball.y = ball.goalY = -R + R2;
		};
		this.__pool.load(300);
		this.__time = Date.now();
		this.__draw();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		let setAppear = false;
		let time = Date.now();
		let count = this.state.count;
		ballsCount = count;
		let prevCount  = prevState.count;
		let deltaCount = count - prevCount;
		if (deltaCount) {
			if (deltaCount > 0) {
				while (deltaCount--) {
					addBall(this.__pool, time);
				}
			} else {
				let s = deltaCount;
				while (deltaCount++) {
					removeBall(this.__pool, s - deltaCount);
					dissapear(balls[prevCount + deltaCount - 1], time, this.__time);
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

	__draw() {
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

	addCircle(delta, ev) {
		if (ev.shiftKey) {
			delta *= 5;
		}
		if (ev.ctrlKey) {
			delta *= 10;
		}

		this.setState({count: Math.max(0, this.state.count + delta)});
	}

	showLines(ev) {
		this.setState({showLines: ev.target.checked});
	}

	setDelay(ev) {
		this.setState({delay: +ev.target.value});
	}

	setAutoDelay(ev) {
		this.setState({autoDelay: ev.target.checked});
	}

	setCount(count) {
		this.setState({count: Math.min(Math.max(0, count), MAX_BALLS)});
	}
}

const SIZE = [600, 600];
const R = 300;
const R2 = Ball.R2;
const DURATION = 4000;
const MAX_LINES = 1000;
const MAX_BALLS = Infinity;
const balls = [];
let ballsCount = 0;

function initCanvases(canvas) {
	canvas.style.width = (canvas.width = SIZE[0]) + 'px';
	canvas.style.height = (canvas.height = SIZE[1]) + 'px';
}

function drawBackground(canvas) {
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

function drawLines(ctx, count) {
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

function drawCircles(ctx, time, delay, fullTime) {
	let dist = R - R2;
	let b = balls;
	ctx.beginPath();
	for (let i = 0; i < b.length; i++) {
		let ball = b[i];
		ball.delay = delay * i;
		let d = animate(dist, time + ball.delay);
		ball.goalX = d * ball.cos;
		ball.goalY = d * ball.sin;
		ball.animate(fullTime);

		ball.draw(ctx);
	}
	ctx.fill();
}

function animate(dist, time) {
	let rest = time % DURATION;
	let part = rest / DURATION;
	return dist * Math.cos(2 * Math.PI * part);
}

function addBall(pool, time, delay) {
	const ball = pool.get();
	if (balls.indexOf(ball) === -1) {
		// ball.x = ball.goalX = -R + R2;
		// ball.y = ball.goalY = -R + R2;
		ball.delay = delay;
		ball.animate = defaultAnimate;
		balls.push(ball);
	}
}

function appear(ball, time, startTime) {
	//if (ball.animate === appearAnimate) return;

/*
	let dx = ball.goalX - ball.x;
	let dy = ball.goalY - ball.y;
	let d1 = Math.sqrt(dx * dx + dy * dy);
	ball.duration = d1 / 300 * 1000;
*/

	let dist = R - R2;
	let t = time - startTime + ball.duration;
	let d = animate(dist, t + ball.delay);

	ball.t0 = time;
	ball.x0 = ball.x;
	ball.y0 = ball.y;
	ball.targetX = d * ball.cos;
	ball.targetY = d * ball.sin;
	ball.animate = appearAnimate;
	// ball.animate(time);
}

function dissapear(ball, time, startTime) {

	ball.t0 = time;
	ball.x0 = ball.x;
	ball.y0 = ball.y;
	ball.targetX = -R + R2;
	ball.targetY = -R + R2;

	ball.animate = animateDisappear;
}

function animateDisappear(time) {
	// appearAnimate.call(this, time);
	if (time > this.t0 + this.duration / 2) {
		// this.animate = defaultAnimate;
/*
		let i = balls.indexOf(this);
		if (i !== -1) {
			balls.splice(i, 1);
		}
*/
		return;
	}
	console.log(this.deltaX);
	let part = (time - this.t0) / (this.duration / 2);
	this.x = cosInterplation(this.x0, this.targetX, part);
	this.y = cosInterplation(this.y0, this.targetY, part);
}

function defaultAnimate() {
	this.x = this.goalX;
	this.y = this.goalY;
}

function appearAnimate(time) {
	if (time > this.t0 + this.duration) {
		this.animate = defaultAnimate;
		this.animate(time);
		return;
	}


	let part = (time - this.t0) / this.duration;
	this.x = cosInterplation(this.x0, this.targetX, part);
	this.y = cosInterplation(this.y0, this.targetY, part);
}

function linearInterpolation (v0, v1, p) {
	return v0 + (v1 - v0) * p;
}

function cosInterplation (v0, v1, p) {
	return v0 + (v1 - v0) * Math.sin(Math.PI * (p) / 2);
}

function removeBall(pool, lastIndex) {
	if (balls.length) {
		pool.put(balls[balls.length + lastIndex]);
	}
}

function updateBallsTrigonometry(autoDelay, delay) {
	let ln = ballsCount;
	delay = autoDelay ? DURATION / ln / 2 : delay;
	let a = Math.PI / ln;
	for (let i = 0; i < ln; i++) {
		const ball = balls[i];
		ball.delay = delay * i;
		ball.sin = Math.sin(a * i);
		ball.cos = Math.cos(a * i);
	}
}



