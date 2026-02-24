import { NextRequest, NextResponse } from "next/server";
import {
	fetchTimingsByCoords,
	fetchTimingsByCity,
	fetchTimingsByAddress,
} from "@/lib/aladhan";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const lat = searchParams.get("latitude");
	const lng = searchParams.get("longitude");
	const city = searchParams.get("city");
	const country = searchParams.get("country");
	const address = searchParams.get("address");
	const dateStr = searchParams.get("date");
	const method = searchParams.get("method");
	const school = searchParams.get("school");
	const timezone = searchParams.get("timezone");

	const methodNum = method ? parseInt(method, 10) : undefined;
	const schoolNum = school ? parseInt(school, 10) : undefined;
	const date = dateStr ? new Date(dateStr) : undefined;

	try {
		if (lat != null && lng != null) {
			const latitude = parseFloat(lat);
			const longitude = parseFloat(lng);
			if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
				return NextResponse.json(
					{ error: "Invalid latitude or longitude" },
					{ status: 400 }
				);
			}
			const data = await fetchTimingsByCoords({
				latitude,
				longitude,
				method: methodNum,
				school: schoolNum,
				timezone: timezone ?? undefined,
				date,
			});
			return NextResponse.json(data);
		}

		if (city && country) {
			const data = await fetchTimingsByCity({
				city,
				country,
				method: methodNum,
				school: schoolNum,
				date,
			});
			return NextResponse.json(data);
		}

		if (address) {
			const data = await fetchTimingsByAddress({
				address,
				method: methodNum,
				school: schoolNum,
				date,
			});
			return NextResponse.json(data);
		}

		return NextResponse.json(
			{ error: "Provide latitude/longitude, or city+country, or address" },
			{ status: 400 }
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to fetch timings";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
