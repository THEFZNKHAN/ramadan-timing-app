"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	useEffect,
} from "react";

export type ToastType = "error" | "info";

export interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
}

type ToastContextValue = {
	toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 5000;

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within ToastProvider");
	return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([]);
	const idRef = useRef(0);
	const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

	const toast = useCallback((message: string, type: ToastType = "error") => {
		const id = ++idRef.current;
		setItems((prev) => [...prev, { id, message, type }]);
		const t = setTimeout(() => {
			setItems((prev) => prev.filter((i) => i.id !== id));
			timeoutsRef.current.delete(id);
		}, TOAST_DURATION_MS);
		timeoutsRef.current.set(id, t);
	}, []);

	useEffect(() => {
		return () => {
			timeoutsRef.current.forEach((t) => clearTimeout(t));
			timeoutsRef.current.clear();
		};
	}, []);

	const dismiss = useCallback((id: number) => {
		const t = timeoutsRef.current.get(id);
		if (t) {
			clearTimeout(t);
			timeoutsRef.current.delete(id);
		}
		setItems((prev) => prev.filter((i) => i.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div
				className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 max-w-md pointer-events-none"
				aria-live="polite"
				role="region"
				aria-label="Notifications"
			>
				{items.map((item) => (
					<div
						key={item.id}
						className="pointer-events-auto relative rounded-xl border px-4 py-3 pr-10 text-sm shadow-lg animate-[section-appear_0.2s_ease-out]"
						role="alert"
						style={{
							backgroundColor:
								item.type === "error"
									? "rgba(248, 113, 113, 0.15)"
									: "rgba(255, 255, 255, 0.08)",
							borderColor:
								item.type === "error"
									? "rgba(248, 113, 113, 0.4)"
									: "rgba(255, 255, 255, 0.12)",
							color: item.type === "error" ? "rgb(248, 113, 113)" : "var(--text-primary)",
						}}
					>
						<p>{item.message}</p>
						<button
							type="button"
							onClick={() => dismiss(item.id)}
							className="absolute top-2 right-2 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
							aria-label="Dismiss"
						>
							<span aria-hidden>×</span>
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}
