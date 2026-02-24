import { NextRequest, NextResponse } from "next/server";
import { fetchTimingsByCoords } from "@/lib/aladhan";
import type { PrayerTimings } from "@/types/prayer";

const PRAYER_ORDER: (keyof PrayerTimings)[] = [
	"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Midnight",
];

function getNextPrayerFromTimings(
	timings: PrayerTimings,
	timezone: string
): { nextPrayer: string; nextPrayerTime: string } | null {
	const order = PRAYER_ORDER;
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: timezone,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const parts = formatter.formatToParts(now);
	const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
	const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
	const nowMins = hour * 60 + minute;

	for (const name of order) {
		const t = timings[name];
		if (!t) continue;
		const m = t.trim().split(" ")[0]?.match(/^(\d{1,2}):(\d{2})$/);
		if (!m) continue;
		const prayerMins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
		if (prayerMins > nowMins) {
			return { nextPrayer: name, nextPrayerTime: t };
		}
	}
	const first = order[0];
	const firstTime = timings[first];
	if (firstTime) {
		return { nextPrayer: first, nextPrayerTime: firstTime };
	}
	return null;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const lat = searchParams.get("latitude");
	const lng = searchParams.get("longitude");
	const city = searchParams.get("city");
	const country = searchParams.get("country");
	const method = searchParams.get("method");
	const school = searchParams.get("school");
	const timezone = searchParams.get("timezone");

	const methodNum = method ? parseInt(method, 10) : undefined;
	const schoolNum = school ? parseInt(school, 10) : undefined;

	try {
		let timingsData;
		if (lat != null && lng != null) {
			const latitude = parseFloat(lat);
			const longitude = parseFloat(lng);
			if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
				return NextResponse.json(
					{ error: "Invalid latitude or longitude" },
					{ status: 400 }
				);
			}
			timingsData = await fetchTimingsByCoords({
				latitude,
				longitude,
				method: methodNum,
				school: schoolNum,
				timezone: timezone ?? undefined,
			});
		} else if (city && country) {
			const { fetchTimingsByCity } = await import("@/lib/aladhan");
			timingsData = await fetchTimingsByCity({
				city,
				country,
				method: methodNum,
				school: schoolNum,
			});
		} else {
			return NextResponse.json(
				{ error: "Provide latitude/longitude or city+country" },
				{ status: 400 }
			);
		}

		const tz = timingsData.meta.timezone;
		const next = getNextPrayerFromTimings(timingsData.timings, tz);
		return NextResponse.json({
			timings: timingsData.timings,
			date: timingsData.date,
			meta: timingsData.meta,
			nextPrayer: next?.nextPrayer ?? "",
			nextPrayerTime: next?.nextPrayerTime ?? "",
		});
	} catch {
		return NextResponse.json(
			{
				nextPrayer: "",
				nextPrayerTime: "",
				timings: {},
				date: {},
				meta: {},
			},
			{ status: 200 }
		);
	}
}
