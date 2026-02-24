"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SavedLocation } from "@/lib/geo";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/Toast";

export interface LocationPickerProps {
	location: SavedLocation | null;
	onLocationChange: (loc: SavedLocation) => void;
	onUseMyLocation: () => void;
	geoLoading?: boolean;
}

export default function LocationPicker({
	location,
	onLocationChange,
	onUseMyLocation,
	geoLoading = false,
}: LocationPickerProps) {
	const { toast } = useToast();
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<
		Array<{ city: string; country: string; latitude: number; longitude: number; timezone?: string }>
	>([]);
	const [searching, setSearching] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(async () => {
			setSearching(true);
			try {
				const res = await fetch(
					`/api/search-city?q=${encodeURIComponent(query.trim())}`
				);
				const data = await res.json();
				if (!res.ok) throw new Error(data.error ?? "Search failed");
				setResults(Array.isArray(data) ? data : []);
			} catch (e) {
				toast(e instanceof Error ? e.message : "Search failed", "error");
				setResults([]);
			} finally {
				setSearching(false);
			}
		}, 300);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, toast]);

	useEffect(() => {
		if (searchOpen) inputRef.current?.focus();
	}, [searchOpen]);

	const selectPlace = useCallback(
		(r: { city: string; country: string; latitude: number; longitude: number; timezone?: string }) => {
			onLocationChange({
				city: r.city,
				country: r.country,
				latitude: r.latitude,
				longitude: r.longitude,
				timezone: r.timezone,
				label: `${r.city}, ${r.country}`,
			});
			setSearchOpen(false);
			setQuery("");
			setResults([]);
		},
		[onLocationChange]
	);

	const label = location?.label ?? (location?.city && location?.country
		? `${location.city}, ${location.country}`
		: location
			? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
			: "Set location");

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-[var(--text-muted)] text-sm">Location:</span>
				<span className="text-[var(--text-primary)] font-medium">
					{label}
				</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setSearchOpen((o) => !o)}
					aria-expanded={searchOpen}
					aria-controls="location-search"
				>
					{searchOpen ? "Cancel" : "Change"}
				</Button>
				<Button
					variant="secondary"
					size="sm"
					onClick={onUseMyLocation}
					disabled={geoLoading}
					aria-busy={geoLoading}
				>
					{geoLoading ? "Detecting…" : "Use my location"}
				</Button>
			</div>
			{searchOpen && (
				<div id="location-search" className="flex flex-col gap-2">
					<label htmlFor="city-search-input" className="sr-only">
						Search city
					</label>
					<input
						ref={inputRef}
						id="city-search-input"
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="e.g. Lahore, London"
						className="w-full min-h-[44px] px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
						aria-describedby="search-results-hint"
					/>
					<p id="search-results-hint" className="sr-only">
						Search results appear below
					</p>
					{searching && (
						<p className="text-[var(--text-muted)] text-sm">Searching…</p>
					)}
					{results.length > 0 && (
						<ul
							className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden divide-y divide-[var(--border-subtle)]"
							role="listbox"
							aria-label="City results"
						>
							{results.map((r, i) => (
								<li key={`${r.city}-${r.country}-${i}`} role="option">
									<button
										type="button"
										className="w-full text-left px-4 py-3 min-h-[44px] text-[var(--text-primary)] hover:bg-white/5 focus:bg-white/5 focus:outline-none"
										onClick={() => selectPlace(r)}
									>
										{r.city}, {r.country}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
