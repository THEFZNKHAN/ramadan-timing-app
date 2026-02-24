"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
	getStoredLocation,
	setStoredLocation,
	getBrowserLocation,
} from "@/lib/geo";
import type { SavedLocation } from "@/lib/geo";
import type { PrayerData, NextPrayerData } from "@/types/prayer";
import LocationPicker from "@/components/LocationPicker";
import HeroRamadan from "@/components/HeroRamadan";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/Toast";

function buildTimingsParams(loc: SavedLocation): string {
	const p = new URLSearchParams();
	p.set("latitude", String(loc.latitude));
	p.set("longitude", String(loc.longitude));
	if (loc.timezone) p.set("timezone", loc.timezone);
	return p.toString();
}

function buildNextPrayerParams(loc: SavedLocation): string {
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

export default function Home(props: PageProps) {
	use(props.params ?? Promise.resolve({}));
	use(props.searchParams ?? Promise.resolve({}));
	const { toast } = useToast();
	const [location, setLocationState] = useState<SavedLocation | null>(null);
	const [timings, setTimings] = useState<PrayerData | null>(null);
	const [nextPrayer, setNextPrayer] = useState<NextPrayerData | null>(null);
	const [loading, setLoading] = useState(true);
	const [geoLoading, setGeoLoading] = useState(false);
	const [geoError, setGeoError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const setLocation = useCallback((loc: SavedLocation) => {
		setStoredLocation(loc);
		setLocationState(loc);
		setError(null);
		setGeoError(null);
	}, []);

	useEffect(() => {
		const stored = getStoredLocation();
		if (stored) {
			setLocationState(stored);
			return;
		}
		setLocationState(null);
		setLoading(false);
	}, []);

	useEffect(() => {
		if (!location) {
			setTimings(null);
			setNextPrayer(null);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setError(null);
		Promise.all([
			fetch(`/api/timings?${buildTimingsParams(location)}`).then((r) =>
				r.json()
			),
			fetch(`/api/next-prayer?${buildNextPrayerParams(location)}`).then((r) =>
				r.json()
			),
		])
			.then(([timingsRes, nextRes]) => {
				if (cancelled) return;
				if (timingsRes.error) throw new Error(timingsRes.error);
				if (nextRes.error) {
					setNextPrayer(null);
				} else {
					setNextPrayer(nextRes);
				}
				setTimings(timingsRes);
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

	// Toast: auto-dismiss geo error after a short delay
	useEffect(() => {
		if (!geoError) return;
		const t = setTimeout(() => setGeoError(null), 5000);
		return () => clearTimeout(t);
	}, [geoError]);

	const handleUseMyLocation = useCallback(() => {
		setGeoError(null);
		setGeoLoading(true);
		getBrowserLocation()
			.then(({ latitude, longitude }) => {
				setLocation({
					latitude,
					longitude,
					label: "Current location",
				});
			})
			.catch((e) => {
				const msg = e instanceof Error ? e.message : "Could not get your location";
				setGeoError(msg);
				toast(msg, "error");
			})
			.finally(() => setGeoLoading(false));
	}, [setLocation]);

	const loadGeoFallback = useCallback(() => {
		setGeoLoading(true);
		setGeoError(null);
		fetch("/api/geo")
			.then((r) => r.json())
			.then((data: { error?: string; detected?: boolean; city?: string; country?: string; latitude?: number; longitude?: number; timezone?: string }) => {
				if (data.error && data.detected === false) {
					setGeoError(data.error);
					toast(data.error, "info");
					return;
				}
				if (data.error) throw new Error(data.error);
				const lat = data.latitude ?? 0;
				const lng = data.longitude ?? 0;
				const hasCoords = (lat !== 0 || lng !== 0) && data.detected !== false;
				if (hasCoords && data.latitude != null && data.longitude != null) {
					setLocation({
						city: data.city,
						country: data.country,
						latitude: data.latitude,
						longitude: data.longitude,
						timezone: data.timezone,
						label:
							data.city && data.country
								? `${data.city}, ${data.country}`
								: "Detected location",
					});
				} else {
					const msg = data.error ?? "Could not detect location. Use \"Use my location\" or search for a city.";
					setGeoError(msg);
					toast(msg, "info");
				}
			})
			.catch((e) => {
				const msg = e instanceof Error ? e.message : "Failed";
				setGeoError(msg);
				toast(msg, "error");
			})
			.finally(() => setGeoLoading(false));
	}, [toast, setLocation]);

	useEffect(() => {
		if (!location && !loading) {
			loadGeoFallback();
		}
	}, [location, loading, loadGeoFallback]);

	return (
		<div className="min-h-screen min-w-0 overflow-x-hidden">
			<div id="main" className="mx-auto max-w-2xl px-4 py-6 sm:py-8 relative z-10 min-w-0 w-full box-border animate-page-in" role="main">
				<header className="text-center mb-8">
					<div className="inline-flex items-center justify-center gap-2 mb-2">
						<span className="text-[var(--accent-gold)] text-2xl" aria-hidden>
							&#x263D;
						</span>
						<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
							Ramadan Timing
						</h1>
						<span className="text-[var(--accent-gold)] text-2xl" aria-hidden>
							&#x263D;
						</span>
					</div>
					<p className="text-[var(--text-muted)] mt-1">
						Sehri & Iftar for your location
					</p>
				</header>

				<div className="space-y-6">
					<LocationPicker
						location={location}
						onLocationChange={setLocation}
						onUseMyLocation={handleUseMyLocation}
						geoLoading={geoLoading}
					/>

					{loading && (
						<div
							className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-8 text-center text-[var(--text-muted)] animate-pulse"
							aria-live="polite"
							aria-busy="true"
						>
							<span className="inline-block h-5 w-32 bg-[var(--border-subtle)] rounded mb-2" />
							<p>Loading timings…</p>
						</div>
					)}

					{!loading && timings && (
						<HeroRamadan data={timings} nextPrayerData={nextPrayer} />
					)}

					{!loading && timings && (
						<div className="flex flex-col sm:flex-row gap-3 min-w-0">
							<Link href="/prayer-times" className="min-w-0 flex-1">
								<Button variant="secondary" className="w-full">
									View all prayer times
								</Button>
							</Link>
							<Link href="/ramadan-month" className="min-w-0 flex-1">
								<Button variant="secondary" className="w-full">
									View Ramadan month
								</Button>
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
