"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (!("IntersectionObserver" in window)) {
			const id = requestAnimationFrame(() => setVisible(true));
			return () => cancelAnimationFrame(id);
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setVisible(true);
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.15 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
			className={cn(
				"transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
				visible
					? "translate-y-0 opacity-100"
					: "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
				className
			)}
		>
			{children}
		</div>
	);
}
