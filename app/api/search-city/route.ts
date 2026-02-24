import { NextRequest, NextResponse } from "next/server";

const OPEN_METEO_SEARCH = "https://geocoding-api.open-meteo.com/v1/search";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const q = searchParams.get("q");
	if (!q || q.trim().length === 0) {
		return NextResponse.json(
			{ error: "Query parameter 'q' is required" },
			{ status: 400 }
		);
	}
	try {
		const url = new URL(OPEN_METEO_SEARCH);
		url.searchParams.set("name", q.trim());
		url.searchParams.set("count", "5");
		url.searchParams.set("language", "en");
		url.searchParams.set("format", "json");
		const res = await fetch(url.toString(), {
			next: { revalidate: 86400 },
		});
		if (!res.ok) throw new Error("Search failed");
		const json = (await res.json()) as {
			results?: Array<{
				name: string;
				country: string;
				latitude: number;
				longitude: number;
				timezone?: string;
			}>;
		};
		const results = json.results ?? [];
		return NextResponse.json(
			results.map((r) => ({
				city: r.name,
				country: r.country,
				latitude: r.latitude,
				longitude: r.longitude,
				timezone: r.timezone,
			}))
		);
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Failed to search city";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
