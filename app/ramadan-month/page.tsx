"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { getStoredLocation } from "@/lib/geo";
import type { SavedLocation } from "@/lib/geo";
import type { PrayerData } from "@/types/prayer";
import { to12HourTime } from "@/lib/format";
import BackLink from "@/components/BackLink";
import { useToast } from "@/components/Toast";

function buildTimingsParams(loc: SavedLocation): string {
	const p = new URLSearchParams();
	p.set("latitude", String(loc.latitude));
	p.set("longitude", String(loc.longitude));
	if (loc.timezone) p.set("timezone", loc.timezone);
	return p.toString();
}

function buildCalendarParams(loc: SavedLocation, hijriYear: number): string {
	const p = new URLSearchParams();
	p.set("year", String(hijriYear));
	p.set("month", "9");
	if (loc.city && loc.country) {
		p.set("city", loc.city);
		p.set("country", loc.country);
	} else {
		p.set("latitude", String(loc.latitude));
		p.set("longitude", String(loc.longitude));
	}
	return p.toString();
}

function parseGregorianDate(
	value: string
): { y: number; m: number; d: number } | null {
	const m = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (!m) return null;
	const d = parseInt(m[1] ?? "0", 10);
	const mon = parseInt(m[2] ?? "0", 10);
	const y = parseInt(m[3] ?? "0", 10);
	if (d < 1 || d > 31 || mon < 1 || mon > 12) return null;
	return { y, m: mon, d };
}

function formatShortDate(readable: string): string {
	const parts = readable.split(" ");
	if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
	return readable;
}

type PageProps = {
	params?: Promise<Record<string, string | string[]>>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function RamadanMonthPage(props: PageProps) {
	use(props.params ?? Promise.resolve({}));
	use(props.searchParams ?? Promise.resolve({}));
	const { toast } = useToast();
	const [location, setLocation] = useState<SavedLocation | null>(null);
	const [days, setDays] = useState<PrayerData[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [todayGregorian, setTodayGregorian] = useState<string>("");

	useEffect(() => {
		const stored = getStoredLocation();
		setLocation(stored);
	}, []);

	useEffect(() => {
		const now = new Date();
		const d = String(now.getDate()).padStart(2, "0");
		const m = String(now.getMonth() + 1).padStart(2, "0");
		const y = now.getFullYear();
		setTodayGregorian(`${d}-${m}-${y}`);
	}, []);

	useEffect(() => {
		if (!location) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setError(null);
		fetch(`/api/timings?${buildTimingsParams(location)}`)
			.then((r) => r.json())
			.then((timingsRes: PrayerData | { error: string }) => {
				if (cancelled) return Promise.reject({ cancelled: true });
				if ("error" in timingsRes) throw new Error(timingsRes.error);
				const hijriYear = parseInt(timingsRes.date.hijri.year, 10);
				const hijriMonth = timingsRes.date.hijri.month.number;
				const targetYear = hijriMonth <= 9 ? hijriYear : hijriYear + 1;
				return fetch(`/api/calendar?${buildCalendarParams(location, targetYear)}`);
			})
			.then((r) => r.json())
			.then((res: PrayerData[] | { error: string }) => {
				if (cancelled) return;
				if (!Array.isArray(res)) throw new Error((res as { error: string }).error ?? "Failed");
				setDays(res);
				if (res.length === 0) {
					toast("Could not load Ramadan month. Try setting a city on the home page.", "info");
				}
			})
			.catch((e) => {
				if (cancelled || (e && typeof e === "object" && "cancelled" in e)) return;
				const msg = e instanceof Error ? e.message : "Failed to load";
				setError(msg);
				toast(msg, "error");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [location, toast]);

	const today = parseGregorianDate(todayGregorian);
	const hijriYear =
		days && days[0]
			? days[0].date.hijri.year
			: new Date().getFullYear().toString();

	return (
		<div className="min-h-screen min-w-0 overflow-x-hidden">
			<div
				id="main"
				className="mx-auto max-w-4xl px-4 py-6 sm:py-8 relative z-10 min-w-0 w-full box-border animate-page-in"
				role="main"
			>
				<BackLink />

				{!location && (
					<div className="rounded-2xl bg-[var(--bg-card)]/90 border border-[var(--border-subtle)] p-8 text-center">
						<p className="text-[var(--text-muted)] mb-4">
							Set your location on the home page to see Ramadan month.
						</p>
						<Link
							href="/"
							className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-soft)] font-medium"
						>
							Go to Ramadan home
						</Link>
					</div>
				)}

				{location && loading && (
					<div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-8 text-center text-[var(--text-muted)] animate-pulse">
						Loading Ramadan month…
					</div>
				)}

				{location && days && days.length > 0 && !error && (
					<>
						<header className="text-center mb-8">
							<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
								Ramadan {hijriYear}
							</h1>
							<p className="text-[var(--text-muted)] mt-1">
								30 days — Sehri & Iftar
							</p>
						</header>

						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
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
									<div
										key={roza}
										className={`rounded-xl border p-3 sm:p-4 min-h-[100px] flex flex-col justify-between ${
											isToday
												? "bg-[var(--accent-gold)]/15 border-[var(--accent-gold)]"
												: "bg-[var(--bg-card)]/90 backdrop-blur-sm border-[var(--border-subtle)]"
										}`}
									>
										<div className="flex justify-between items-start">
											<span className="text-[var(--text-muted)] text-xs font-medium">
												Roza {roza}
											</span>
											{isToday && (
												<span className="text-[var(--accent-gold)] text-xs font-semibold">
													Today
												</span>
											)}
										</div>
										<p className="text-[var(--text-muted)] text-xs mt-0.5">
											{formatShortDate(day.date.readable)}
										</p>
										<div className="mt-2 space-y-1">
											<p className="text-[var(--text-primary)] text-sm">
												<span className="text-[var(--text-muted)] text-xs">Sehri </span>
												<span className="tabular-nums font-medium">
													{to12HourTime(day.timings.Fajr)}
												</span>
											</p>
											<p className="text-[var(--accent-gold)] text-sm">
												<span className="text-[var(--text-muted)] text-xs">Iftar </span>
												<span className="tabular-nums font-medium">
													{to12HourTime(day.timings.Maghrib)}
												</span>
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}

			</div>
		</div>
	);
}
