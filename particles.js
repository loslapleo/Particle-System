const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

const n = 700;
const m = 7;
const dt = 0.02;
const frictionHalfLife = 0.04;
const rMax = 0.15;
const frictionFactor = Math.pow(0.5, dt / frictionHalfLife);
const forceFactor = 7;
const particles = spawnParticles();

function spawnParticles() {
	const rows = [];
	for (let i = 0; i < m; i++) {
		const row = [];
		for (let j = 0; j < m; j++) {
			row.push(Math.random() * 2 - 1);
		}
		rows.push(row);
	}
	return rows;
}

const colors = new Int32Array(n);
const positionsX = new Float32Array(n);
const positionsY = new Float32Array(n);
const velocitiesX = new Float32Array(n);
const velocitiesY = new Float32Array(n);

for (let i = 0; i < n; i++) {
	colors[i] = Math.floor(Math.random() * m);
	positionsX[i] = Math.random();
	positionsY[i] = Math.random();
	velocitiesX[i] = 0;
	velocitiesY[i] = 0;
}

function loop() {
	updateParticles();
	drawParticles();
	requestAnimationFrame(loop);
}

function updateParticles() {
	// update velocities
	for (let i = 0; i < n; i++) {
		let totalForceX = 0;
		let totalForceY = 0;

		for (let j = 0; j < n; j++) {
			if (j === i) continue;
			let rx = positionsX[j] - positionsX[i];
			let ry = positionsY[j] - positionsY[i];
			rx -= Math.round(rx);
			ry -= Math.round(ry);
			const r = Math.hypot(rx, ry);

			if (r > 0 && r < rMax) {
				const f = force(r / rMax, particles[colors[i]][colors[j]]);
				totalForceX += rx / r * f;
				totalForceY += ry / r * f;
			}
		}

		totalForceX *= rMax * forceFactor;
		totalForceY *= rMax * forceFactor;

		velocitiesX[i] *= frictionFactor;
		velocitiesY[i] *= frictionFactor;

		velocitiesX[i] += totalForceX * dt;
		velocitiesY[i] += totalForceY * dt;
	}

	// update positions
	for (let i = 0; i < n; i++) {
		positionsX[i] += velocitiesX[i] * dt;
		positionsY[i] += velocitiesY[i] * dt;

		if (positionsX[i] > 1) {
			positionsX[i] -= 1;
		} else if (positionsX[i] < 0) {
			positionsX[i] += 1;
		}

		if (positionsY[i] > 1) {
			positionsY[i] -= 1;
		} else if (positionsY[i] < 0) {
			positionsY[i] += 1;
		}
	}
}

function drawParticles() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < n; i++) {
		ctx.beginPath();
		const screenX = positionsX[i] * canvas.width;
		const screenY = positionsY[i] * canvas.height;
		ctx.arc(screenX, screenY, 1.5, 0, 2 * Math.PI);
		ctx.fillStyle = `hsl(${360 * (colors[i] / m)},100%,50%)`;
		ctx.fill();
	}
}

function force(r, a) {
	const beta = 0.3;
	if (r < beta) {
		return r / beta - 1;
	} else if (beta < r && r < 1) {
		return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
	} else {
		return 0;
	}
}

// call the loop to start
requestAnimationFrame(loop);

