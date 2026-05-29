"use client";

import { useEffect, useRef } from "react";
import { CHAOS_ICONS } from "@/lib/constants/marketing";

const ICON_SIZE = 52;

interface Sprite {
	x: number;
	y: number;
	vx: number;
	vy: number;
	rot: number;
	vrot: number;
	phase: number;
}

export function ChaosVisual() {
	const fieldRef = useRef<HTMLDivElement>(null);
	const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		const field = fieldRef.current;
		if (!field) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const mouse = { x: -999, y: -999 };
		const sprites: Sprite[] = CHAOS_ICONS.map(() => ({
			x: 0,
			y: 0,
			vx: (Math.random() - 0.5) * 1.1,
			vy: (Math.random() - 0.5) * 1.1,
			rot: Math.random() * 360,
			vrot: (Math.random() - 0.5) * 0.6,
			phase: Math.random() * Math.PI * 2,
		}));

		const layout = () => {
			const w = field.clientWidth;
			const h = field.clientHeight;
			for (const s of sprites) {
				s.x = Math.random() * Math.max(0, w - ICON_SIZE);
				s.y = Math.random() * Math.max(0, h - ICON_SIZE);
			}
		};
		layout();

		const onResize = () => layout();
		const onMove = (e: MouseEvent) => {
			const rect = field.getBoundingClientRect();
			mouse.x = e.clientX - rect.left;
			mouse.y = e.clientY - rect.top;
		};
		const onLeave = () => {
			mouse.x = -999;
			mouse.y = -999;
		};
		window.addEventListener("resize", onResize);
		field.addEventListener("mousemove", onMove);
		field.addEventListener("mouseleave", onLeave);

		let raf = 0;
		const tick = (t: number) => {
			const w = field.clientWidth;
			const h = field.clientHeight;
			sprites.forEach((s, i) => {
				const cx = s.x + ICON_SIZE / 2;
				const cy = s.y + ICON_SIZE / 2;
				const dx = cx - mouse.x;
				const dy = cy - mouse.y;
				const dist = Math.hypot(dx, dy);
				if (dist < 120 && dist > 0.01) {
					const force = (1 - dist / 120) * 0.9;
					s.vx += (dx / dist) * force;
					s.vy += (dy / dist) * force;
				}

				s.vx *= 0.985;
				s.vy *= 0.985;
				const speed = Math.hypot(s.vx, s.vy);
				const min = 0.35;
				if (speed < min && speed > 0.001) {
					s.vx = (s.vx / speed) * min;
					s.vy = (s.vy / speed) * min;
				}
				const max = 3.2;
				if (speed > max) {
					s.vx = (s.vx / speed) * max;
					s.vy = (s.vy / speed) * max;
				}

				s.x += s.vx;
				s.y += s.vy;

				if (s.x <= 0) {
					s.x = 0;
					s.vx = Math.abs(s.vx);
				} else if (s.x >= w - ICON_SIZE) {
					s.x = w - ICON_SIZE;
					s.vx = -Math.abs(s.vx);
				}
				if (s.y <= 0) {
					s.y = 0;
					s.vy = Math.abs(s.vy);
				} else if (s.y >= h - ICON_SIZE) {
					s.y = h - ICON_SIZE;
					s.vy = -Math.abs(s.vy);
				}

				s.rot += s.vrot;
				const scale = 1 + Math.sin(t / 700 + s.phase) * 0.06;
				const node = iconRefs.current[i];
				if (node) {
					node.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg) scale(${scale})`;
				}
			});
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
			field.removeEventListener("mousemove", onMove);
			field.removeEventListener("mouseleave", onLeave);
		};
	}, []);

	return (
		<div>
			<span className="mb-3 block text-left text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
				Your knowledge today...
			</span>
			<div
				ref={fieldRef}
				className="relative h-[360px] overflow-hidden rounded-[14px] border border-dashed border-border bg-card/40"
			>
				{CHAOS_ICONS.map((Icon, i) => (
					<div
						key={i}
						ref={(el) => {
							iconRefs.current[i] = el;
						}}
						className="absolute top-0 left-0 flex size-[52px] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-lg will-change-transform"
					>
						<Icon className="size-[26px]" strokeWidth={1.7} />
					</div>
				))}
			</div>
		</div>
	);
}
