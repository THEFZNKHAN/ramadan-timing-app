"use client";

import { useState, useEffect } from "react";
import type { PrayerData, NextPrayerData } from "@/types/prayer";
import { to12HourTime } from "@/lib/format";

function formatCountdown(minutes: number): string {
	const safe = Math.max(minutes, 0);
	const h = Math.floor(safe / 60);
	const m = safe % 60;
	if (h === 0) return `${m}m`;
	return `${h}h ${m}m`;
}

function useCountdown(
	nextPrayerTime: string | undefined,
	timezone: string | undefined
): string | null {
	const [countdown, setCountdown] = useState<string | null>(null);

	useEffect(() => {
		if (!nextPrayerTime || !timezone) {
			setCountdown(null);
			return;
		}
		const update = () => {
			try {
				const match = nextPrayerTime.trim().split(" ")[0]?.match(/^(\d{1,2}):(\d{2})$/);
				if (!match) {
					setCountdown(null);
					return;
				}
				const hour = parseInt(match[1] ?? "0", 10);
				const minute = parseInt(match[2] ?? "0", 10);
				const now = new Date();
				const formatter = new Intl.DateTimeFormat("en-CA", {
					timeZone: timezone,
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				});
				const parts = formatter.formatToParts(now);
				const get = (type: string) =>
					Number(parts.find((p) => p.type === type)?.value ?? 0);
				const nowMinutes = get("hour") * 60 + get("minute");
				const targetMinutes = hour * 60 + minute;
				let diff = targetMinutes - nowMinutes;
				if (diff <= 0) diff += 24 * 60;
				setCountdown(formatCountdown(diff));
			} catch {
				setCountdown(null);
			}
		};
		update();
		const t = setInterval(update, 60 * 1000);
		return () => clearInterval(t);
	}, [nextPrayerTime, timezone]);

	return countdown;
}

export interface HeroRamadanProps {
	data: PrayerData;
	nextPrayerData?: NextPrayerData | null;
}

export default function HeroRamadan({ data, nextPrayerData }: HeroRamadanProps) {
	const sehri = to12HourTime(data.timings.Fajr);
	const iftar = to12HourTime(data.timings.Maghrib);
	const countdown = useCountdown(
		nextPrayerData?.nextPrayerTime,
		data.meta.timezone
	);
	const nextLabel =
		nextPrayerData?.nextPrayer === "Maghrib"
			? "Iftar"
			: nextPrayerData?.nextPrayer === "Fajr"
				? "Sehri"
				: nextPrayerData?.nextPrayer ?? "Next";

	const hijriLabel = `${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year}`;

	return (
		<section
			className="relative rounded-2xl bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-subtle)] p-6 sm:p-8 overflow-hidden shadow-[0_0_40px_rgba(212,168,83,0.08),inset_0_1px_0_rgba(255,255,255,0.03)] animate-section-in smooth-transition"
			aria-label="Today’s Ramadan times"
		>
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,168,83,0.12),transparent)] pointer-events-none" />
			<div className="relative">
				<p className="text-[var(--text-muted)] text-sm mb-1">
					{data.date.readable}
				</p>
				<p
					className="text-[var(--accent-gold-soft)] text-lg font-[var(--font-arabic)] mb-6"
					style={{ fontFamily: "var(--font-arabic)" }}
				>
					{hijriLabel}
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
					<div>
						<p className="text-[var(--text-muted)] text-sm font-medium uppercase tracking-wider mb-1">
							Sehri
						</p>
						<p className="text-3xl sm:text-4xl font-semibold text-[var(--accent-gold)]">
							{sehri}
						</p>
					</div>
					<div>
						<p className="text-[var(--text-muted)] text-sm font-medium uppercase tracking-wider mb-1">
							Iftar
						</p>
						<p className="text-3xl sm:text-4xl font-semibold text-[var(--accent-gold)]">
							{iftar}
						</p>
					</div>
				</div>
				{countdown != null && (
					<div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
						<p className="text-[var(--text-muted)] text-sm">
							{nextLabel} in{" "}
							<span className="text-[var(--accent-gold-soft)] font-medium">
								{countdown}
							</span>
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
