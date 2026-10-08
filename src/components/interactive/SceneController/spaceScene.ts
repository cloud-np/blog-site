/**
 * Landing page space backdrop.
 *
 * Two canvases are driven from a single animation loop:
 *  - `stars`: a fixed, full-viewport starfield with depth layers, twinkling,
 *    pointer/scroll parallax and the occasional shooting star.
 *  - `planet`: a static render of the planet horizon (with its atmosphere) and
 *    a couple of moons. It is only redrawn on resize; scroll/pointer parallax is
 *    applied through a compositor-only transform.
 */

interface Star {
	/** Position normalised to the star field (0..1) so resizes never re-seed the sky. */
	nx: number;
	ny: number;
	/** Depth: 0 = far away, 1 = closest to the viewer. */
	z: number;
	radius: number;
	alpha: number;
	twinkleSpeed: number;
	twinkleAmp: number;
	phase: number;
	color: number;
	sprite: boolean;
}

interface ShootingStar {
	x: number;
	y: number;
	vx: number;
	vy: number;
	age: number;
	life: number;
	length: number;
}

export interface SpaceSceneOptions {
	stars: HTMLCanvasElement;
	planet: HTMLCanvasElement;
	/** Element the planet horizon sits right under (the hero). */
	anchor?: HTMLElement | null;
}

export interface SpaceScene {
	destroy(): void;
}

const STAR_COLORS = ["255, 255, 255", "214, 228, 255", "176, 204, 255", "255, 236, 204", "255, 206, 186"];
const STAR_COLOR_WEIGHTS = [0.55, 0.25, 0.1, 0.07, 0.03];
/** Stars travel slowly down-left, like the original scene. */
const DRIFT_ANGLE = (145 / 180) * Math.PI;
const FIELD_MARGIN = 60;
const MAX_DPR = 2;
const FRAME_MS = 1000 / 60;
const PLANET_SCROLL_FACTOR = 0.6;
const STAR_SCROLL_FACTOR = 0.08;

/** Deterministic PRNG so the planet/moon surfaces look the same after every resize. */
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function pickWeighted(weights: number[]): number {
	let roll = Math.random();
	for (let i = 0; i < weights.length; i++) {
		roll -= weights[i];
		if (roll <= 0) return i;
	}
	return weights.length - 1;
}

function createStarSprite(rgb: string, withSpikes: boolean): HTMLCanvasElement {
	const size = 64;
	const sprite = document.createElement("canvas");
	sprite.width = sprite.height = size;
	const ctx = sprite.getContext("2d")!;
	const c = size / 2;

	const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
	glow.addColorStop(0, `rgba(${rgb}, 1)`);
	glow.addColorStop(0.1, `rgba(${rgb}, 0.9)`);
	glow.addColorStop(0.25, `rgba(${rgb}, 0.28)`);
	glow.addColorStop(0.55, `rgba(${rgb}, 0.06)`);
	glow.addColorStop(1, `rgba(${rgb}, 0)`);
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, size, size);

	if (withSpikes) {
		ctx.globalCompositeOperation = "lighter";
		for (const horizontal of [true, false]) {
			const spike = horizontal
				? ctx.createLinearGradient(0, c, size, c)
				: ctx.createLinearGradient(c, 0, c, size);
			spike.addColorStop(0, `rgba(${rgb}, 0)`);
			spike.addColorStop(0.5, `rgba(${rgb}, 0.55)`);
			spike.addColorStop(1, `rgba(${rgb}, 0)`);
			ctx.fillStyle = spike;
			if (horizontal) ctx.fillRect(0, c - 0.5, size, 1);
			else ctx.fillRect(c - 0.5, 0, 1, size);
		}
	}

	return sprite;
}

function createStars(count: number): Star[] {
	const stars: Star[] = [];
	for (let i = 0; i < count; i++) {
		// Most stars are far away, a handful are close and bright.
		const layerRoll = Math.random();
		const z =
			layerRoll < 0.72
				? 0.1 + Math.random() * 0.25
				: layerRoll < 0.94
					? 0.4 + Math.random() * 0.25
					: 0.7 + Math.random() * 0.3;

		stars.push({
			nx: Math.random(),
			ny: Math.random(),
			z,
			radius: 0.35 + z * 1.15,
			alpha: 0.3 + z * 0.6,
			twinkleSpeed: 0.6 + Math.random() * 2.2,
			// Distant stars scintillate more than the close, bright ones.
			twinkleAmp: 0.15 + (1 - z) * 0.5 * Math.random(),
			phase: Math.random() * Math.PI * 2,
			color: pickWeighted(STAR_COLOR_WEIGHTS),
			sprite: z > 0.62,
		});
	}
	// Group by colour so the draw loop barely has to switch fill styles.
	return stars.sort((a, b) => a.color - b.color);
}

function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number) {
	const rand = mulberry32(seed);

	ctx.save();
	// Faint halo
	const halo = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.9);
	halo.addColorStop(0, "rgba(160, 185, 230, 0.10)");
	halo.addColorStop(1, "rgba(160, 185, 230, 0)");
	ctx.fillStyle = halo;
	ctx.beginPath();
	ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.clip();

	const body = ctx.createRadialGradient(x - r * 0.45, y - r * 0.45, 0, x - r * 0.2, y - r * 0.2, r * 1.45);
	body.addColorStop(0, "#5d6676");
	body.addColorStop(0.45, "#2c323e");
	body.addColorStop(1, "#0b0d13");
	ctx.fillStyle = body;
	ctx.fillRect(x - r, y - r, r * 2, r * 2);

	// Craters
	for (let i = 0; i < 9; i++) {
		const angle = rand() * Math.PI * 2;
		const dist = Math.sqrt(rand()) * r * 0.85;
		const cx = x + Math.cos(angle) * dist;
		const cy = y + Math.sin(angle) * dist;
		const cr = r * (0.06 + rand() * 0.16);
		ctx.fillStyle = "rgba(5, 7, 12, 0.28)";
		ctx.beginPath();
		ctx.arc(cx, cy, cr, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "rgba(190, 205, 230, 0.10)";
		ctx.lineWidth = Math.max(0.6, cr * 0.18);
		ctx.beginPath();
		ctx.arc(cx + cr * 0.12, cy + cr * 0.12, cr, Math.PI * 0.05, Math.PI * 0.95);
		ctx.stroke();
	}

	// Terminator: the side facing away from the light falls into shadow.
	const shade = ctx.createLinearGradient(x - r * 0.6, y - r * 0.6, x + r, y + r);
	shade.addColorStop(0, "rgba(4, 5, 10, 0)");
	shade.addColorStop(0.55, "rgba(4, 5, 10, 0.35)");
	shade.addColorStop(1, "rgba(4, 5, 10, 0.92)");
	ctx.fillStyle = shade;
	ctx.fillRect(x - r, y - r, r * 2, r * 2);
	ctx.restore();

	// Lit rim
	ctx.save();
	ctx.strokeStyle = "rgba(200, 220, 255, 0.22)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(x, y, r - 0.5, Math.PI * 0.95, Math.PI * 1.65);
	ctx.stroke();
	ctx.restore();
}

function drawRingedPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
	const tilt = -0.32;
	const ringRx = r * 2.15;
	const ringRy = r * 0.5;

	const strokeRing = (start: number, end: number) => {
		const bands: [number, string, number][] = [
			[1.0, "rgba(230, 205, 175, 0.30)", 1.4],
			[0.9, "rgba(210, 180, 150, 0.18)", 2.4],
			[0.78, "rgba(240, 220, 195, 0.24)", 1],
			[0.7, "rgba(200, 170, 140, 0.10)", 3],
		];
		for (const [scale, color, width] of bands) {
			ctx.strokeStyle = color;
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.ellipse(x, y, ringRx * scale, ringRy * scale, tilt, start, end);
			ctx.stroke();
		}
	};

	// Back half of the ring sits behind the planet.
	strokeRing(Math.PI, Math.PI * 2);

	ctx.save();
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.clip();
	const body = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, 0, x - r * 0.2, y - r * 0.2, r * 1.4);
	body.addColorStop(0, "#9b7a66");
	body.addColorStop(0.45, "#4a3631");
	body.addColorStop(1, "#110c0e");
	ctx.fillStyle = body;
	ctx.fillRect(x - r, y - r, r * 2, r * 2);

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(tilt);
	for (let i = -3; i <= 3; i++) {
		ctx.fillStyle = i % 2 === 0 ? "rgba(255, 220, 190, 0.06)" : "rgba(30, 15, 15, 0.12)";
		ctx.fillRect(-r, i * r * 0.26 - r * 0.07, r * 2, r * 0.14);
	}
	ctx.restore();

	const shade = ctx.createLinearGradient(x - r * 0.5, y - r * 0.7, x + r, y + r * 0.8);
	shade.addColorStop(0, "rgba(6, 4, 8, 0)");
	shade.addColorStop(0.6, "rgba(6, 4, 8, 0.45)");
	shade.addColorStop(1, "rgba(6, 4, 8, 0.92)");
	ctx.fillStyle = shade;
	ctx.fillRect(x - r, y - r, r * 2, r * 2);
	ctx.restore();

	// Front half of the ring crosses in front of the planet.
	strokeRing(0, Math.PI);
}

export function createSpaceScene({ stars: starsCanvas, planet: planetCanvas, anchor }: SpaceSceneOptions): SpaceScene {
	const starsCtx = starsCanvas.getContext("2d");
	const planetCtx = planetCanvas.getContext("2d");
	if (!starsCtx || !planetCtx) return { destroy() {} };

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	const finePointer = window.matchMedia("(pointer: fine)");
	const controller = new AbortController();
	const listen = { signal: controller.signal, passive: true } as const;

	const sprites = STAR_COLORS.map(rgb => createStarSprite(rgb, false));
	const spikedSprites = STAR_COLORS.map(rgb => createStarSprite(rgb, true));

	let width = 0;
	let height = 0;
	let dpr = 1;
	let stars: Star[] = [];
	let starArea = 0;
	let planetHeight = 0;
	let planetWidth = 0;
	let planetAnchor = 0;
	let planetCssHeight = 0;
	let planetTransform = "";

	const shootingStars: ShootingStar[] = [];
	let nextShootingStarAt = performance.now() + 2500 + Math.random() * 4000;

	const pointer = { x: 0, y: 0 };
	const parallax = { x: 0, y: 0 };

	let rafId = 0;
	let lastFrame = 0;
	let resizeQueued = false;

	function resize() {
		resizeQueued = false;
		dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
		width = starsCanvas.clientWidth || window.innerWidth;
		height = starsCanvas.clientHeight || window.innerHeight;

		starsCanvas.width = Math.round(width * dpr);
		starsCanvas.height = Math.round(height * dpr);

		// Only re-seed when the sky changes size substantially (e.g. rotating a phone),
		// not when a mobile URL bar collapses.
		const area = width * height;
		if (!stars.length || Math.abs(area - starArea) / starArea > 0.4) {
			starArea = area;
			stars = createStars(Math.min(750, Math.round(area / 2600)));
		}

		// The URL bar showing/hiding only changes the height a little; skip the
		// relatively expensive planet repaint in that case.
		const anchorBox = getAnchorBox();
		if (
			width !== planetWidth ||
			Math.abs(height - planetHeight) > 120 ||
			Math.abs(anchorBox.bottom - planetAnchor) > 4
		) {
			planetWidth = width;
			planetHeight = height;
			planetAnchor = anchorBox.bottom;
			renderPlanet(anchorBox);
		}

		if (reducedMotion.matches) drawStars(0);
	}

	function queueResize() {
		if (resizeQueued) return;
		resizeQueued = true;
		requestAnimationFrame(resize);
	}

	/** Vertical extent of the anchor in page coordinates. */
	function getAnchorBox() {
		if (!anchor) return { top: height * 0.08, bottom: height * 0.38 };
		const rect = anchor.getBoundingClientRect();
		return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
	}

	function renderPlanet(anchorBox: { top: number; bottom: number }) {
		const w = width;
		const h = height;
		const rimTop = Math.max(anchorBox.bottom - 28, h * 0.25);
		const radius = Math.max(w * 0.85, 560);
		const cx = w / 2;
		const cy = rimTop + radius;
		const canvasHeight = Math.ceil(rimTop + Math.min(radius, h * 0.95));

		planetCssHeight = canvasHeight;
		planetCanvas.style.height = `${canvasHeight}px`;
		planetCanvas.width = Math.round(w * dpr);
		planetCanvas.height = Math.round(canvasHeight * dpr);

		const ctx = planetCtx!;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, canvasHeight);

		const rand = mulberry32(7);
		// Light comes from beyond the top-left of the screen.
		const lightX = cx - radius * 0.35;
		const lightY = rimTop - radius * 0.35;

		// --- Moons -----------------------------------------------------------
		const moonRadius = Math.max(14, Math.min(42, Math.min(w, h) / 22));
		if (w < 640) {
			// On phones the hero text spans the full width, so tuck the moons into the
			// gap between the header and the heading instead of behind the text.
			drawMoon(ctx, w * 0.1, anchorBox.top + moonRadius + 4, moonRadius, 11);
			drawRingedPlanet(ctx, w * 0.88, anchorBox.top + moonRadius + 10, moonRadius * 0.62);
		} else {
			drawMoon(ctx, w * 0.1, Math.min(h * 0.34, rimTop - moonRadius * 2.5), moonRadius, 11);
			drawRingedPlanet(ctx, w * 0.86, h * 0.17, moonRadius * 0.62);
		}

		// --- Planet body -----------------------------------------------------
		ctx.save();
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.clip();

		const body = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, radius * 1.15);
		body.addColorStop(0, "#1b2742");
		body.addColorStop(0.3, "#0d1528");
		body.addColorStop(0.6, "#070b16");
		body.addColorStop(1, "#04060c");
		ctx.fillStyle = body;
		ctx.fillRect(0, rimTop, w, canvasHeight - rimTop);

		// Cloud bands follow the curvature of the planet.
		for (let i = 0; i < 26; i++) {
			const depth = Math.pow(rand(), 1.6) * Math.min(radius, h) * 0.9;
			const hue = rand() > 0.6 ? "120, 210, 230" : "130, 160, 255";
			ctx.strokeStyle = `rgba(${hue}, ${0.012 + rand() * 0.035})`;
			ctx.lineWidth = 2 + rand() * 26;
			ctx.beginPath();
			ctx.arc(cx, cy, radius - depth, Math.PI * 1.02, Math.PI * 1.98);
			ctx.stroke();
		}

		// Night side shading towards the right edge.
		const night = ctx.createLinearGradient(lightX, 0, cx + radius * 0.9, 0);
		night.addColorStop(0, "rgba(2, 3, 8, 0)");
		night.addColorStop(1, "rgba(2, 3, 8, 0.55)");
		ctx.fillStyle = night;
		ctx.fillRect(0, rimTop, w, canvasHeight - rimTop);
		ctx.restore();

		// --- Atmosphere ------------------------------------------------------
		const inner = radius - 90;
		const outer = radius + 150;
		const stop = (r: number) => Math.min(1, Math.max(0, (r - inner) / (outer - inner)));
		const atmosphereCanvas = document.createElement("canvas");
		atmosphereCanvas.width = planetCanvas.width;
		atmosphereCanvas.height = planetCanvas.height;
		const actx = atmosphereCanvas.getContext("2d")!;
		actx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const atmosphere = actx.createRadialGradient(cx, cy, inner, cx, cy, outer);
		atmosphere.addColorStop(0, "rgba(70, 150, 255, 0)");
		atmosphere.addColorStop(stop(radius - 22), "rgba(70, 150, 255, 0.08)");
		atmosphere.addColorStop(stop(radius - 3), "rgba(150, 215, 255, 0.55)");
		atmosphere.addColorStop(stop(radius - 0.5), "rgba(215, 240, 255, 0.95)");
		atmosphere.addColorStop(stop(radius + 2), "rgba(110, 195, 255, 0.5)");
		atmosphere.addColorStop(stop(radius + 18), "rgba(70, 150, 255, 0.2)");
		atmosphere.addColorStop(stop(radius + 60), "rgba(80, 110, 255, 0.06)");
		atmosphere.addColorStop(1, "rgba(80, 110, 255, 0)");
		actx.fillStyle = atmosphere;
		actx.fillRect(0, 0, w, canvasHeight);

		// The limb is brightest where it faces the light.
		actx.globalCompositeOperation = "destination-in";
		const lit = actx.createRadialGradient(lightX, lightY, 0, lightX, lightY, radius * 1.25);
		lit.addColorStop(0, "rgba(0, 0, 0, 1)");
		lit.addColorStop(0.55, "rgba(0, 0, 0, 0.75)");
		lit.addColorStop(1, "rgba(0, 0, 0, 0.12)");
		actx.fillStyle = lit;
		actx.fillRect(0, 0, w, canvasHeight);

		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalCompositeOperation = "lighter";
		ctx.drawImage(atmosphereCanvas, 0, 0);
		ctx.restore();

		// Fade the body out so the canvas never ends with a hard edge.
		ctx.save();
		ctx.globalCompositeOperation = "destination-out";
		const fadeStart = rimTop + (canvasHeight - rimTop) * 0.45;
		const fade = ctx.createLinearGradient(0, fadeStart, 0, canvasHeight);
		fade.addColorStop(0, "rgba(0, 0, 0, 0)");
		fade.addColorStop(1, "rgba(0, 0, 0, 1)");
		ctx.fillStyle = fade;
		ctx.fillRect(0, fadeStart, w, canvasHeight - fadeStart);
		ctx.restore();
	}

	function spawnShootingStar(now: number) {
		const angle = DRIFT_ANGLE + (Math.random() - 0.5) * 0.4;
		const speed = 700 + Math.random() * 500;
		shootingStars.push({
			x: width * (0.25 + Math.random() * 0.75),
			y: height * Math.random() * 0.45,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			age: 0,
			life: 0.6 + Math.random() * 0.45,
			length: 90 + Math.random() * 110,
		});
		nextShootingStarAt = now + 5000 + Math.random() * 9000;
	}

	function drawStars(time: number) {
		const ctx = starsCtx!;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, width, height);

		const fieldW = width + FIELD_MARGIN * 2;
		const fieldH = height + FIELD_MARGIN * 2;
		const scroll = reducedMotion.matches ? 0 : window.scrollY * STAR_SCROLL_FACTOR;
		const offsetX = -parallax.x * 28;
		const offsetY = -parallax.y * 18 - scroll;

		let currentColor = -1;
		for (const star of stars) {
			let x = (star.nx * fieldW + offsetX * star.z) % fieldW;
			let y = (star.ny * fieldH + offsetY * star.z) % fieldH;
			if (x < 0) x += fieldW;
			if (y < 0) y += fieldH;
			x -= FIELD_MARGIN;
			y -= FIELD_MARGIN;
			if (x < -8 || y < -8 || x > width + 8 || y > height + 8) continue;

			const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.phase);
			ctx.globalAlpha = star.alpha * (1 - star.twinkleAmp * twinkle);

			if (star.sprite) {
				const sprite = star.z > 0.93 ? spikedSprites[star.color] : sprites[star.color];
				const size = star.radius * 9;
				ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
			} else {
				if (star.color !== currentColor) {
					currentColor = star.color;
					ctx.fillStyle = `rgb(${STAR_COLORS[currentColor]})`;
				}
				const d = star.radius * 2;
				ctx.fillRect(x - star.radius, y - star.radius, d, d);
			}
		}

		ctx.globalAlpha = 1;
		ctx.lineCap = "round";
		for (const s of shootingStars) {
			const progress = s.age / s.life;
			const envelope = Math.sin(Math.PI * progress);
			const speed = Math.hypot(s.vx, s.vy);
			const tailX = s.x - (s.vx / speed) * s.length * envelope;
			const tailY = s.y - (s.vy / speed) * s.length * envelope;
			const trail = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
			trail.addColorStop(0, `rgba(235, 245, 255, ${0.9 * envelope})`);
			trail.addColorStop(0.3, `rgba(170, 210, 255, ${0.35 * envelope})`);
			trail.addColorStop(1, "rgba(170, 210, 255, 0)");
			ctx.strokeStyle = trail;
			ctx.lineWidth = 1.3;
			ctx.beginPath();
			ctx.moveTo(s.x, s.y);
			ctx.lineTo(tailX, tailY);
			ctx.stroke();

			ctx.globalAlpha = envelope;
			ctx.drawImage(sprites[1], s.x - 6, s.y - 6, 12, 12);
			ctx.globalAlpha = 1;
		}
	}

	function updatePlanetTransform() {
		const scroll = window.scrollY;
		const shift = -Math.min(scroll * PLANET_SCROLL_FACTOR, planetCssHeight + 200);
		const transform = `translate3d(${(-parallax.x * 10).toFixed(2)}px, ${(shift - parallax.y * 6).toFixed(2)}px, 0)`;
		if (transform !== planetTransform) {
			planetTransform = transform;
			planetCanvas.style.transform = transform;
		}
	}

	function frame(now: number) {
		rafId = requestAnimationFrame(frame);
		const elapsed = now - lastFrame;
		if (elapsed < FRAME_MS - 1) return;
		const dt = Math.min(elapsed, 100) / 1000;
		lastFrame = now;

		const ease = Math.min(1, dt * 2.5);
		parallax.x += (pointer.x - parallax.x) * ease;
		parallax.y += (pointer.y - parallax.y) * ease;

		// Drift the whole sky; closer stars move faster.
		const fieldW = width + FIELD_MARGIN * 2;
		const fieldH = height + FIELD_MARGIN * 2;
		const dx = Math.cos(DRIFT_ANGLE) * dt;
		const dy = Math.sin(DRIFT_ANGLE) * dt;
		for (const star of stars) {
			const speed = 0.8 + star.z * 4;
			star.nx = (star.nx + (dx * speed) / fieldW + 1) % 1;
			star.ny = (star.ny + (dy * speed) / fieldH + 1) % 1;
		}

		if (now >= nextShootingStarAt && !document.hidden) spawnShootingStar(now);
		for (let i = shootingStars.length - 1; i >= 0; i--) {
			const s = shootingStars[i];
			s.age += dt;
			s.x += s.vx * dt;
			s.y += s.vy * dt;
			if (s.age >= s.life) shootingStars.splice(i, 1);
		}

		drawStars(now / 1000);
		updatePlanetTransform();
	}

	function start() {
		cancelAnimationFrame(rafId);
		if (reducedMotion.matches) {
			shootingStars.length = 0;
			parallax.x = parallax.y = pointer.x = pointer.y = 0;
			planetCanvas.style.transform = planetTransform = "";
			drawStars(0);
			return;
		}
		lastFrame = 0;
		rafId = requestAnimationFrame(frame);
	}

	function stop() {
		cancelAnimationFrame(rafId);
		rafId = 0;
	}

	// Watch the hero too: web fonts settling can move the horizon.
	const resizeObserver = new ResizeObserver(queueResize);
	resizeObserver.observe(starsCanvas);
	if (anchor) resizeObserver.observe(anchor);
	window.addEventListener(
		"pointermove",
		event => {
			if (!finePointer.matches || event.pointerType !== "mouse") return;
			pointer.x = (event.clientX / width) * 2 - 1;
			pointer.y = (event.clientY / height) * 2 - 1;
		},
		listen
	);
	document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()), listen);
	reducedMotion.addEventListener("change", start, listen);

	resize();
	start();
	starsCanvas.dataset.ready = "true";
	planetCanvas.dataset.ready = "true";

	return {
		destroy() {
			stop();
			controller.abort();
			resizeObserver.disconnect();
		},
	};
}
