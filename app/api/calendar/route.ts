import { NextRequest, NextResponse } from "next/server";
import {
	fetchHijriCalendarByCity,
	fetchHijriCalendarByAddress,
} from "@/lib/aladhan";

const RAMADAN_HIJRI_MONTH = 9;

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const city = searchParams.get("city");
	const country = searchParams.get("country");
	const address = searchParams.get("address");
	const lat = searchParams.get("latitude");
	const lng = searchParams.get("longitude");
	const yearStr = searchParams.get("year");
	const monthStr = searchParams.get("month");
	const method = searchParams.get("method");
	const school = searchParams.get("school");

	const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
	const month = monthStr ? parseInt(monthStr, 10) : RAMADAN_HIJRI_MONTH;
	const methodNum = method ? parseInt(method, 10) : undefined;
	const schoolNum = school ? parseInt(school, 10) : undefined;

	if (Number.isNaN(year) || Number.isNaN(month)) {
		return NextResponse.json(
			{ error: "Invalid year or month" },
			{ status: 400 }
		);
	}

	try {
		if (city && country) {
			const data = await fetchHijriCalendarByCity({
				city,
				country,
				year,
				month,
				method: methodNum,
				school: schoolNum,
			});
			return NextResponse.json(data);
		}

		if (address) {
			const data = await fetchHijriCalendarByAddress({
				address,
				year,
				month,
				method: methodNum,
				school: schoolNum,
			});
			return NextResponse.json(data);
		}

		if (lat != null && lng != null) {
			const latitude = parseFloat(lat);
			const longitude = parseFloat(lng);
			if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
				return NextResponse.json(
					{ error: "Invalid latitude or longitude" },
					{ status: 400 }
				);
			}
			const data = await fetchHijriCalendarByAddress({
				address: `${latitude},${longitude}`,
				year,
				month,
				method: methodNum,
				school: schoolNum,
			});
			return NextResponse.json(data);
		}

		return NextResponse.json(
			{ error: "Provide city+country, address, or latitude+longitude" },
			{ status: 400 }
		);
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Failed to fetch calendar";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
