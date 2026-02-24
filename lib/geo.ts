"use client";

export interface SavedLocation {
	city?: string;
	country?: string;
	latitude: number;
	longitude: number;
	timezone?: string;
	label?: string;
}

const STORAGE_KEY = "ramadan-timing-location";

export function getStoredLocation(): SavedLocation | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as unknown;
		if (
			parsed &&
			typeof parsed === "object" &&
			"latitude" in parsed &&
			"longitude" in parsed &&
			typeof (parsed as SavedLocation).latitude === "number" &&
			typeof (parsed as SavedLocation).longitude === "number"
		) {
			return parsed as SavedLocation;
		}
		return null;
	} catch {
		return null;
	}
}

export function setStoredLocation(loc: SavedLocation): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
	} catch {
		// ignore
	}
}

export function clearStoredLocation(): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}

export function getBrowserLocation(): Promise<{
	latitude: number;
	longitude: number;
}> {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Geolocation is not supported"));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				resolve({
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
				});
			},
			(err) => reject(err),
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
		);
	});
}
