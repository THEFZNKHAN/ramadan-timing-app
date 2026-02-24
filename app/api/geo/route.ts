import { NextResponse } from "next/server";

interface GeoResult {
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	timezone: string;
	detected?: boolean;
}

async function tryIpapiCo(): Promise<GeoResult | null> {
	try {
		const res = await fetch("https://ipapi.co/json/", {
			headers: { Accept: "application/json" },
			next: { revalidate: 3600 },
		});
		if (!res.ok) return null;
		const json = (await res.json()) as {
			city?: string;
			country_name?: string;
			latitude?: number;
			longitude?: number;
			timezone?: string;
		};
		if (
			json.latitude == null ||
			json.longitude == null ||
			typeof json.latitude !== "number" ||
			typeof json.longitude !== "number"
		) {
			return null;
		}
		return {
			city: json.city ?? "",
			country: json.country_name ?? "",
			latitude: json.latitude,
			longitude: json.longitude,
			timezone: json.timezone ?? "",
			detected: true,
		};
	} catch {
		return null;
	}
}

async function tryIpWhois(): Promise<GeoResult | null> {
	try {
		const res = await fetch("https://ipwho.is/", {
			headers: { Accept: "application/json" },
			next: { revalidate: 3600 },
		});
		if (!res.ok) return null;
		const json = (await res.json()) as {
			success?: boolean;
			city?: string;
			country?: string;
			latitude?: number;
			longitude?: number;
			timezone?: { id?: string };
		};
		if (!json.success || json.latitude == null || json.longitude == null) {
			return null;
		}
		return {
			city: json.city ?? "",
			country: json.country ?? "",
			latitude: json.latitude,
			longitude: json.longitude,
			timezone: json.timezone?.id ?? "",
			detected: true,
		};
	} catch {
		return null;
	}
}

export async function GET() {
	const fromIpapi = await tryIpapiCo();
	if (fromIpapi) {
		return NextResponse.json(fromIpapi);
	}
	const fromIpwhois = await tryIpWhois();
	if (fromIpwhois) {
		return NextResponse.json(fromIpwhois);
	}
	// No provider succeeded: return 200 with empty result so the app can show
	// "Use my location" or city search instead of a broken 500
	return NextResponse.json({
		city: "",
		country: "",
		latitude: 0,
		longitude: 0,
		timezone: "",
		detected: false,
		error: "Could not detect location. Use \"Use my location\" or search for a city.",
	});
}
