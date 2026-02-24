export interface PrayerTimings {
	readonly Fajr: string;
	readonly Sunrise: string;
	readonly Dhuhr: string;
	readonly Asr: string;
	readonly Sunset: string;
	readonly Maghrib: string;
	readonly Isha: string;
	readonly Imsak: string;
	readonly Midnight: string;
	readonly Firstthird: string;
	readonly Lastthird: string;
}

export interface HijriDate {
	readonly date: string;
	readonly day: string;
	readonly month: {
		readonly number: number;
		readonly en: string;
		readonly ar: string;
	};
	readonly year: string;
	readonly weekday: {
		readonly en: string;
		readonly ar: string;
	};
}

export interface GregorianDate {
	readonly date: string;
	readonly day: string;
	readonly month: {
		readonly number: number;
		readonly en: string;
	};
	readonly year: string;
	readonly weekday: {
		readonly en: string;
	};
}

export interface PrayerMeta {
	readonly latitude: number;
	readonly longitude: number;
	readonly timezone: string;
	readonly method: {
		readonly id: number;
		readonly name: string;
	};
	readonly school:
		| { readonly id: number; readonly name: string }
		| string;
}

export interface PrayerData {
	readonly timings: PrayerTimings;
	readonly date: {
		readonly readable: string;
		readonly timestamp: string;
		readonly hijri: HijriDate;
		readonly gregorian: GregorianDate;
	};
	readonly meta: PrayerMeta;
}

export interface NextPrayerData {
	readonly timings: PrayerTimings;
	readonly date: PrayerData["date"];
	readonly meta: PrayerMeta;
	readonly nextPrayer: string;
	readonly nextPrayerTime: string;
}

export interface CalculationMethod {
	readonly id: number;
	readonly name: string;
	readonly params: {
		readonly Fajr: number;
		readonly Isha: number | string;
	};
}

export type MethodsResponse = Readonly<Record<string, CalculationMethod>>;
