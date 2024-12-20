import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface Scenario {
	situation: string;
	optionA: string;
	optionB: string;
}

export const normalizeScenario = (scenario: Partial<Scenario>): Scenario => ({
	situation: scenario.situation || "",
	optionA: scenario.optionA || "",
	optionB: scenario.optionB || "",
});
