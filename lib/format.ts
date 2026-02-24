/**
 * Convert 24h time string (e.g. "05:30") to 12h with AM/PM.
 */
export function to12HourTime(value: string): string {
	const cleanValue = value.split(" ")[0] ?? value;
	const match = cleanValue.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return cleanValue;

	const hour = Number.parseInt(match[1] ?? "", 10);
	const minute = Number.parseInt(match[2] ?? "", 10);
	const invalid =
		Number.isNaN(hour) ||
		Number.isNaN(minute) ||
		hour < 0 ||
		hour > 23 ||
		minute < 0 ||
		minute > 59;
	if (invalid) return cleanValue;

	const period = hour >= 12 ? "PM" : "AM";
	const twelveHour = hour % 12 || 12;
	return `${twelveHour}:${String(minute).padStart(2, "0")} ${period}`;
}
