"use client";

import Link from "next/link";

export default function BackLink() {
	return (
		<Link
			href="/"
			className="inline-flex items-center gap-2 text-[var(--accent-gold)] hover:text-[var(--accent-gold-soft)] transition-colors text-sm font-medium mb-6"
		>
			<span aria-hidden>&larr;</span>
			Ramadan
		</Link>
	);
}
