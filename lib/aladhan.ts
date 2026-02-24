import { z } from "zod";
import type { PrayerData, NextPrayerData, MethodsResponse } from "@/types/prayer";

const API_BASE = "https://api.aladhan.com/v1";

const PrayerTimingsSchema = z.object({
	Fajr: z.string(),
	Sunrise: z.string(),
	Dhuhr: z.string(),
	Asr: z.string(),
	Sunset: z.string(),
	Maghrib: z.string(),
	Isha: z.string(),
	Imsak: z.string(),
	Midnight: z.string(),
	Firstthird: z.string(),
	Lastthird: z.string(),
});

const HijriDateSchema = z.object({
	date: z.string(),
	day: z.string(),
	month: z.object({ number: z.number(), en: z.string(), ar: z.string() }),
	year: z.string(),
	weekday: z.object({ en: z.string(), ar: z.string() }),
});

const GregorianDateSchema = z.object({
	date: z.string(),
	day: z.string(),
	month: z.object({ number: z.number(), en: z.string() }),
	year: z.string(),
	weekday: z.object({ en: z.string() }),
});

const PrayerMetaSchema = z.object({
	latitude: z.number(),
	longitude: z.number(),
	timezone: z.string(),
	method: z.object({ id: z.number(), name: z.string() }),
	school: z.union([
		z.object({ id: z.number(), name: z.string() }),
		z.string(),
	]),
});

const PrayerDataSchema = z.object({
	timings: PrayerTimingsSchema,
	date: z.object({
		readable: z.string(),
		timestamp: z.string(),
		hijri: HijriDateSchema,
		gregorian: GregorianDateSchema,
	}),
	meta: PrayerMetaSchema,
});

const NextPrayerDataSchema = z.object({
	timings: PrayerTimingsSchema,
	date: z.object({
		readable: z.string(),
		timestamp: z.string(),
		hijri: HijriDateSchema,
		gregorian: GregorianDateSchema,
	}),
	meta: PrayerMetaSchema,
	nextPrayer: z.string(),
	nextPrayerTime: z.string(),
});

const CalculationMethodSchema = z.object({
	id: z.number(),
	name: z.string(),
	params: z.object({
		Fajr: z.number(),
		Isha: z.union([z.number(), z.string()]),
	}),
});

const ApiEnvelopeSchema = z.object({
	code: z.number(),
	status: z.string(),
	data: z.unknown(),
});

function formatDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}-${month}-${year}`;
}

function parseApiResponse<T extends z.ZodTypeAny>(
	payload: unknown,
	dataSchema: T
): z.infer<T> {
	const parsedEnvelope = ApiEnvelopeSchema.safeParse(payload);
	if (!parsedEnvelope.success) {
		throw new Error(
			`Invalid API response: ${parsedEnvelope.error.issues[0]?.message ?? "Unknown"}`
		);
	}
	if (parsedEnvelope.data.code !== 200) {
		throw new Error(
			`API ${parsedEnvelope.data.code}: ${parsedEnvelope.data.status}`
		);
	}
	if (typeof parsedEnvelope.data.data === "string") {
		throw new Error(`API returned message: ${parsedEnvelope.data.data}`);
	}
	const parsedData = dataSchema.safeParse(parsedEnvelope.data.data);
	if (!parsedData.success) {
		throw new Error(
			`Invalid API data: ${parsedData.error.issues[0]?.message ?? "Unknown"}`
		);
	}
	return parsedData.data;
}

async function fetchAndParse<T extends z.ZodTypeAny>(
	url: string,
	dataSchema: T
): Promise<z.infer<T>> {
	const response = await fetch(url);
	const json = (await response.json()) as unknown;
	return parseApiResponse(json, dataSchema);
}

export interface FetchTimingsByCoordsOptions {
	latitude: number;
	longitude: number;
	method?: number;
	school?: number;
	timezone?: string;
	date?: Date;
}

export function fetchTimingsByCoords(
	opts: FetchTimingsByCoordsOptions
): Promise<PrayerData> {
	const date = formatDate(opts.date ?? new Date());
	const params = new URLSearchParams({
		latitude: String(opts.latitude),
		longitude: String(opts.longitude),
	});
	if (opts.method !== undefined) params.set("method", String(opts.method));
	if (opts.school !== undefined) params.set("school", String(opts.school));
	if (opts.timezone) params.set("timezonestring", opts.timezone);
	return fetchAndParse(
		`${API_BASE}/timings/${date}?${params}`,
		PrayerDataSchema
	);
}

export interface FetchTimingsByCityOptions {
	city: string;
	country: string;
	method?: number;
	school?: number;
	date?: Date;
}

export function fetchTimingsByCity(
	opts: FetchTimingsByCityOptions
): Promise<PrayerData> {
	const date = formatDate(opts.date ?? new Date());
	const params = new URLSearchParams({
		city: opts.city,
		country: opts.country,
	});
	if (opts.method !== undefined) params.set("method", String(opts.method));
	if (opts.school !== undefined) params.set("school", String(opts.school));
	return fetchAndParse(
		`${API_BASE}/timingsByCity/${date}?${params}`,
		PrayerDataSchema
	);
}

export interface FetchTimingsByAddressOptions {
	address: string;
	method?: number;
	school?: number;
	date?: Date;
}

export function fetchTimingsByAddress(
	opts: FetchTimingsByAddressOptions
): Promise<PrayerData> {
	const date = formatDate(opts.date ?? new Date());
	const params = new URLSearchParams({ address: opts.address });
	if (opts.method !== undefined) params.set("method", String(opts.method));
	if (opts.school !== undefined) params.set("school", String(opts.school));
	return fetchAndParse(
		`${API_BASE}/timingsByAddress/${date}?${params}`,
		PrayerDataSchema
	);
}

export interface FetchNextPrayerOptions {
	latitude: number;
	longitude: number;
	method?: number;
	school?: number;
	timezone?: string;
}

export function fetchNextPrayer(
	opts: FetchNextPrayerOptions
): Promise<NextPrayerData> {
	const date = formatDate(new Date());
	const params = new URLSearchParams({
		latitude: String(opts.latitude),
		longitude: String(opts.longitude),
	});
	if (opts.method !== undefined) params.set("method", String(opts.method));
	if (opts.school !== undefined) params.set("school", String(opts.school));
	if (opts.timezone) params.set("timezonestring", opts.timezone);
	return fetchAndParse(
		`${API_BASE}/nextPrayer/${date}?${params}`,
		NextPrayerDataSchema
	);
}

export interface FetchHijriCalendarByCityOptions {
	city: string;
	country: string;
	year: number;
	month: number;
	method?: number;
	school?: number;
}

export function fetchHijriCalendarByCity(
	opts: FetchHijriCalendarByCityOptions
): Promise<ReadonlyArray<PrayerData>> {
	const params = new URLSearchParams({
		city: opts.city,
		country: opts.country,
	});
	if (opts.method !== undefined) params.set("method", String(opts.method));
	if (opts.school !== undefined) params.set("school", String(opts.school));
	return fetchAndParse(
		`${API_BASE}/hijriCalendarByCity/${opts.year}/${opts.month}?${params}`,
		z.array(PrayerDataSchema)
	);
}

export interface FetchHijriCalendarByAddressOptions {
	address: string;
	year: number;
	month: number;
	method?: number;
	school?: number;
}

export function fetchHijriCalendarByAddress(
	opts: FetchHijriCalendarByAddressOptions
): Promise<ReadonlyArray<PrayerData>> {
	const params = new URLSearchParams({ address: opts.address });
	if (opts.method !== undefined) params.set("method", String(opts.method));
	if (opts.school !== undefined) params.set("school", String(opts.school));
	return fetchAndParse(
		`${API_BASE}/hijriCalendarByAddress/${opts.year}/${opts.month}?${params}`,
		z.array(PrayerDataSchema)
	);
}

export function fetchMethods(): Promise<MethodsResponse> {
	return fetchAndParse(
		`${API_BASE}/methods`,
		z.record(z.string(), CalculationMethodSchema)
	);
}
