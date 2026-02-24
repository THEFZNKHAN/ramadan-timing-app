"use client";

import type { PrayerTimings } from "@/types/prayer";
import { to12HourTime } from "@/lib/format";

const PRAYER_ORDER: Array<{ key: keyof PrayerTimings; label: string }> = [
	{ key: "Imsak", label: "Imsak" },
	{ key: "Fajr", label: "Fajr" },
	{ key: "Sunrise", label: "Sunrise" },
	{ key: "Dhuhr", label: "Dhuhr" },
	{ key: "Asr", label: "Asr" },
	{ key: "Sunset", label: "Sunset" },
	{ key: "Maghrib", label: "Maghrib" },
	{ key: "Isha", label: "Isha" },
	{ key: "Midnight", label: "Midnight" },
];

export interface AllPrayerTimesProps {
	timings: PrayerTimings;
}

export default function AllPrayerTimes({ timings }: AllPrayerTimesProps) {
	return (
		<section
			className="rounded-2xl bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-subtle)] overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.2)] min-w-0"
			aria-label="All prayer times"
		>
			<div className="px-4 py-3 border-b border-[var(--border-subtle)]">
				<h2 className="text-lg font-semibold text-[var(--text-primary)]">
					All prayer times
				</h2>
			</div>
			<ul className="divide-y divide-[var(--border-subtle)]">
				{PRAYER_ORDER.map(({ key, label }) => {
					const raw = timings[key];
					const time = raw ? to12HourTime(raw) : "—";
					const isSeharIftar = key === "Fajr" || key === "Maghrib";
					return (
						<li
							key={key}
							className="flex items-center justify-between px-4 py-3 min-h-[48px]"
						>
							<span
								className={
									isSeharIftar
										? "text-[var(--accent-gold)] font-medium"
										: "text-[var(--text-primary)]"
								}
							>
								{label}
								{isSeharIftar && (
									<span className="text-[var(--text-muted)] font-normal text-sm ml-1">
										{key === "Fajr" ? " (Sehri)" : " (Iftar)"}
									</span>
								)}
							</span>
							<span className="text-[var(--text-primary)] tabular-nums">
								{time}
							</span>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
