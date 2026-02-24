"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 320;
const MOONLIGHT_GRADIENT = "rgba(212,168,83,0.06)";

function seededRandom(seed: number) {
	const x = Math.sin(seed * 9999) * 10000;
	return x - Math.floor(x);
}

export default function NightSky() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationId: number;
		let stars: Array<{
			x: number;
			y: number;
			radius: number;
			brightness: number;
			twinklePhase: number;
			twinkleSpeed: number;
			secondPhase: number;
			secondSpeed: number;
			scintillate: boolean;
		}> = [];

		function resize() {
			const w = window.innerWidth;
			const h = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);
			initStars(w, h);
			draw();
		}

		function initStars(w: number, h: number) {
			stars = [];
			for (let i = 0; i < STAR_COUNT; i++) {
				const r = seededRandom(i + 3);
				const radius = r < 0.5 ? 1.5 : r < 0.85 ? 2 : 2.8;
				const speed = 0.8 + seededRandom(i + 7) * 1.4;
				const phase = seededRandom(i + 6) * Math.PI * 2;
				const secondSpeed = 1.5 + seededRandom(i + 8) * 2;
				const secondPhase = seededRandom(i + 9) * Math.PI * 2;
				const scintillate = seededRandom(i + 10) < 0.25;
				stars.push({
					x: seededRandom(i + 1) * w,
					y: seededRandom(i + 2) * h,
					radius,
					brightness: 0.6 + seededRandom(i + 5) * 0.4,
					twinklePhase: phase,
					twinkleSpeed: speed,
					secondPhase,
					secondSpeed,
					scintillate,
				});
			}
		}

		function drawGradient() {
			const w = window.innerWidth;
			const h = window.innerHeight;
			const gradient = ctx.createLinearGradient(0, 0, 0, h);
			gradient.addColorStop(0, "#060714");
			gradient.addColorStop(0.2, "#0a0b18");
			gradient.addColorStop(0.4, "#080a14");
			gradient.addColorStop(0.7, "#050710");
			gradient.addColorStop(1, "#030508");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, w, h);
			const moonGlow = ctx.createRadialGradient(
				w * 0.85,
				h * 0.1,
				0,
				w * 0.85,
				h * 0.1,
				w * 0.6
			);
			moonGlow.addColorStop(0, MOONLIGHT_GRADIENT);
			moonGlow.addColorStop(0.5, "rgba(212,168,83,0.02)");
			moonGlow.addColorStop(1, "transparent");
			ctx.fillStyle = moonGlow;
			ctx.fillRect(0, 0, w, h);
		}

		const prefersReducedMotion =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		function drawStars(time: number) {
			stars.forEach((star) => {
				let twinkle: number;
				if (prefersReducedMotion) {
					twinkle = star.brightness;
				} else {
					const slow = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
					const fast = Math.sin(time * star.secondSpeed + star.secondPhase);
					const base = 0.5 + 0.5 * slow;
					const layer2 = star.scintillate ? 0.25 * fast * (fast > 0 ? 1 : 0) : 0;
					twinkle = star.brightness * Math.min(1, base + layer2);
				}
				const blur = star.radius >= 2 ? (4 + twinkle * 4) : 2 + twinkle * 2;
				ctx.shadowColor = `rgba(255, 255, 255, ${0.7 + twinkle * 0.3})`;
				ctx.shadowBlur = blur;
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
				ctx.fill();
				ctx.shadowBlur = 0;
			});
		}

		function draw() {
			const time = performance.now() * 0.001;
			drawGradient();
			drawStars(time);
			animationId = requestAnimationFrame(draw);
		}

		resize();
		window.addEventListener("resize", resize);
		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return (
		<div
			className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
			aria-hidden
		>
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full block"
				style={{ display: "block" }}
			/>
			{/* Crescent moon (SVG on top of canvas) */}
			<div className="absolute top-[8%] right-[10%] w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 z-[1]">
				<svg
					viewBox="0 0 100 100"
					className="w-full h-full drop-shadow-[0_0_24px_rgba(212,168,83,0.5)]"
					aria-hidden
				>
					<defs>
						<mask id="crescent-mask">
							<circle cx="50" cy="50" r="45" fill="white" />
							<circle cx="68" cy="50" r="42" fill="black" />
						</mask>
						<linearGradient id="moon-glow" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#e8c97a" stopOpacity="1" />
							<stop offset="100%" stopColor="#d4a853" stopOpacity="0.9" />
						</linearGradient>
					</defs>
					<circle
						cx="50"
						cy="50"
						r="45"
						fill="url(#moon-glow)"
						mask="url(#crescent-mask)"
					/>
				</svg>
			</div>
		</div>
	);
}
