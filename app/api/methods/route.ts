import { NextResponse } from "next/server";
import { fetchMethods } from "@/lib/aladhan";

export async function GET() {
	try {
		const data = await fetchMethods();
		return NextResponse.json(data);
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Failed to fetch methods";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
