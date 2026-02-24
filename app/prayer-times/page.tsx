"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { getStoredLocation } from "@/lib/geo";
import type { SavedLocation } from "@/lib/geo";
import type { PrayerData } from "@/types/prayer";
import type { PrayerTimings } from "@/types/prayer";
import { to12HourTime } from "@/lib/format";
import BackLink from "@/components/BackLink";
import { useToast } from "@/components/Toast";

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

function buildTimingsParams(loc: SavedLocation): string {
	const p = new URLSearchParams();
	p.set("latitude", String(loc.latitude));
	p.set("longitude", String(loc.longitude));
	if (loc.timezone) p.set("timezone", loc.timezone);
	return p.toString();
}

type PageProps = {
	params?: Promise<Record<string, string | string[]>>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function PrayerTimesPage(props: PageProps) {
	use(props.params ?? Promise.resolve({}));
	use(props.searchParams ?? Promise.resolve({}));
	const { toast } = useToast();
	const [location, setLocation] = useState<SavedLocation | null>(null);
	const [data, setData] = useState<PrayerData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const stored = getStoredLocation();
		setLocation(stored);
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
			.then((res: PrayerData | { error: string }) => {
				if (cancelled) return;
				if ("error" in res) throw new Error(res.error);
				setData(res);
			})
			.catch((e) => {
				if (!cancelled) {
					const msg = e instanceof Error ? e.message : "Failed to load";
					setError(msg);
					toast(msg, "error");
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [location]);

	const locationLabel =
		location?.label ??
		(location?.city && location?.country
			? `${location.city}, ${location.country}`
			: location
				? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
				: "");

	return (
		<div className="min-h-screen min-w-0 overflow-x-hidden">
			<div
				id="main"
				className="mx-auto max-w-2xl px-4 py-6 sm:py-8 relative z-10 min-w-0 w-full box-border animate-page-in"
				role="main"
			>
				<BackLink />

				{!location && (
					<div className="rounded-2xl bg-[var(--bg-card)]/90 border border-[var(--border-subtle)] p-8 text-center">
						<p className="text-[var(--text-muted)] mb-4">
							Set your location on the home page to see prayer times.
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
						Loading prayer times…
					</div>
				)}

				{location && data && !error && (
					<>
						<header className="text-center mb-8">
							<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
								All prayer times
							</h1>
							<p className="text-[var(--text-muted)] mt-1">{data.date.readable}</p>
							<p className="text-[var(--text-muted)] text-sm mt-0.5">
								{locationLabel}
							</p>
						</header>

						<section
							className="rounded-2xl bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-subtle)] overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.2)]"
							aria-label="Prayer times"
						>
							<ul className="divide-y divide-[var(--border-subtle)]">
								{PRAYER_ORDER.map(({ key, label }) => {
									const raw = data.timings[key];
									const time = raw ? to12HourTime(raw) : "—";
									const isSehriIftar = key === "Fajr" || key === "Maghrib";
									return (
										<li
											key={key}
											className="flex items-center justify-between px-5 py-4 min-h-[56px]"
										>
											<span
												className={
													isSehriIftar
														? "text-[var(--accent-gold)] font-semibold text-lg"
														: "text-[var(--text-primary)] font-medium"
												}
											>
												{label}
												{isSehriIftar && (
													<span className="text-[var(--text-muted)] font-normal text-sm ml-2">
														{key === "Fajr" ? " (Sehri)" : " (Iftar)"}
													</span>
												)}
											</span>
											<span className="text-[var(--text-primary)] tabular-nums text-lg font-medium">
												{time}
											</span>
										</li>
									);
								})}
							</ul>
						</section>
					</>
				)}
			</div>
		</div>
	);
}
