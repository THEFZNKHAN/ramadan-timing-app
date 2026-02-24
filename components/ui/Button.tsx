"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className = "",
			variant = "primary",
			size = "md",
			disabled,
			children,
			...props
		},
		ref
	) => {
		const base =
			"inline-flex items-center justify-center font-medium rounded-xl transition-[transform,color,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.33,1,0.68,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] min-h-[44px] min-w-[44px] touch-manipulation hover:scale-[1.02] active:scale-[0.98]";
		const variants = {
			primary:
				"bg-[var(--accent-gold)] text-[var(--bg-deep)] hover:bg-[var(--accent-gold-soft)]",
			secondary:
				"bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)]/80",
			ghost:
				"text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5",
		};
		const sizes = {
			sm: "px-3 py-2 text-sm",
			md: "px-4 py-2.5 text-base",
			lg: "px-6 py-3 text-lg",
		};
		return (
			<button
				ref={ref}
				className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
				disabled={disabled}
				{...props}
			>
				{children}
			</button>
		);
	}
);
Button.displayName = "Button";
export default Button;
