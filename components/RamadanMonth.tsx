"use client";

import type { PrayerData } from "@/types/prayer";
import { to12HourTime } from "@/lib/format";

export interface RamadanMonthProps {
	days: PrayerData[];
	todayGregorianDate: string;
}

function parseGregorianDate(value: string): { y: number; m: number; d: number } | null {
	const m = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (!m) return null;
	const d = parseInt(m[1] ?? "0", 10);
	const mon = parseInt(m[2] ?? "0", 10);
	const y = parseInt(m[3] ?? "0", 10);
	if (d < 1 || d > 31 || mon < 1 || mon > 12) return null;
	return { y, m: mon, d };
}

export default function RamadanMonth({
	days,
	todayGregorianDate,
}: RamadanMonthProps) {
	const today = parseGregorianDate(todayGregorianDate);

	return (
		<section
			className="rounded-2xl bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-subtle)] overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.2)] min-w-0"
			aria-label="Ramadan full month"
		>
			<div className="px-4 py-3 border-b border-[var(--border-subtle)]">
				<h2 className="text-lg font-semibold text-[var(--text-primary)]">
					Ramadan — Full month
				</h2>
			</div>
			<div className="overflow-x-auto min-w-0">
				<table className="w-full min-w-[320px] text-left">
					<thead>
						<tr className="text-[var(--text-muted)] text-sm border-b border-[var(--border-subtle)]">
							<th className="px-4 py-3 font-medium">Roza</th>
							<th className="px-4 py-3 font-medium">Date</th>
							<th className="px-4 py-3 font-medium">Sehri</th>
							<th className="px-4 py-3 font-medium">Iftar</th>
						</tr>
					</thead>
					<tbody>
						{days.map((day, index) => {
							const roza = index + 1;
							const gr = parseGregorianDate(day.date.gregorian.date);
							const isToday =
								today &&
								gr &&
								today.y === gr.y &&
								today.m === gr.m &&
								today.d === gr.d;
							return (
								<tr
									key={roza}
									className={
										isToday
											? "bg-[var(--accent-gold)]/10 border-l-2 border-[var(--accent-gold)]"
											: ""
									}
								>
									<td className="px-4 py-2.5 text-[var(--text-primary)]">
										{roza}
									</td>
									<td className="px-4 py-2.5 text-[var(--text-muted)] text-sm">
										{day.date.readable}
									</td>
									<td className="px-4 py-2.5 text-[var(--text-primary)] tabular-nums">
										{to12HourTime(day.timings.Fajr)}
									</td>
									<td className="px-4 py-2.5 text-[var(--text-primary)] tabular-nums">
										{to12HourTime(day.timings.Maghrib)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}
