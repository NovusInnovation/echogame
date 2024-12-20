import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";
import { CoreMessage, GenerateObjectResult } from "npm:ai";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateObject } from "npm:ai";
import { z } from "npm:zod";
import { createOpenAI } from "npm:@ai-sdk/openai";

const SYSTEMPROMPT =
	"Create a brief current event scenario (2-3 sentences) for a country leadership game. The user is the leader of a country, that is going downhill. Then provide exactly 2 response options, each between 1-4 words (these should be SUPER short). The response options should present different approaches to handling the situation. The below scenarios are the previous scenarios, Generate the NEXT scenario based on the previous scenario";
const OPENAI_MODEL = "gpt-4o-2024-08-06";

Deno.serve(async (req) => {
	const { scenarioToExpand } = await req.json();
	try {
		const supabase = createClient<Database>(
			Deno.env.get("URL") ?? "",
			Deno.env.get("SERVICE_ROLE_KEY") ?? "",
			{
				global: {
					headers: {
						Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
					},
				},
			},
		);

		const choices = (
			await supabase
				.from("cards")
				.select("id, leading_choice, content")
				.eq("parent", scenarioToExpand)
		).data;

		let previousScenarios: null | CoreMessage[] = null;

		const result = await Promise.all(
			choices?.map(async ({ id, leading_choice, content }) => {
				if (content != null) {
					console.log("already generated scenarios");
					const { data } = await supabase
						.from("cards")
						.select("leading_choice, id")
						.eq("parent", id);
					content = content as { text: string };
					if (data == null || data.length == 0) {
						throw new Error("No options for the scenario");
					}
					return clientScenario(content.text as string, data);
				}
				if (previousScenarios == null) {
					previousScenarios = await getPreviousScenarios(
						supabase,
						scenarioToExpand,
					);
				}

				const pMsgs: CoreMessage[] = [
					...previousScenarios,
					{
						role: "user",
						content: leading_choice?.toString() ?? "",
					},
				];
				console.log(id);
				const r = await generateScenario(pMsgs);

				await supabase
					.from("cards")
					.update({
						content: { text: r.object.situation },
					})
					.eq("id", id);

				const { data: optionRows } = await supabase
					.from("cards")
					.insert([
						{
							parent: id,
							leading_choice: r.object.optionA,
						},
						{ parent: id, leading_choice: r.object.optionB },
					])
					.select();

				return clientScenario(r.object.situation, optionRows);
			}) ?? [],
		);

		return new Response(
			JSON.stringify({
				data: [result],
				previousScenarios,
			}),
			{
				headers: { "Content-Type": "application/json" },
				status: 200,
			},
		);
	} catch (err) {
		return new Response(String(err?.message ?? err), { status: 500 });
	}
});

async function generateScenario(messages: CoreMessage[]): Promise<
	GenerateObjectResult<{
		situation: string;
		optionA: string;
		optionB: string;
	}>
> {
	const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
	if (!OPENAI_API_KEY) {
		throw new Error("Invalid config");
	}
	const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
	const object = await generateObject({
		model: openai(OPENAI_MODEL),
		schema: z.object({
			situation: z.string(),
			optionA: z.string(),
			optionB: z.string(),
		}),
		messages: [
			{
				role: "system",
				content: SYSTEMPROMPT,
			},
			...messages,
		],
	});
	console.log(object);
	return object;
}

const clientScenario = (
	situation: string,
	optionRows: { leading_choice: string | null; id: number }[],
) => ({
	situation,
	optionA: { text: optionRows[0].leading_choice, id: optionRows[0].id },
	optionB: { text: optionRows[1].leading_choice, id: optionRows[1].id },
});

async function getPreviousScenarios(
	supabase: SupabaseClient<Database>,
	startId: number,
) {
	const { data, error } = await supabase.rpc("get_linked_rows", {
		start_id: startId,
	});

	data?.reverse();

	if (error) {
		throw error;
	}
	const previousScenarios: CoreMessage[] = data.flatMap((d) => {
		const content = d.content as { text: string } | null;

		const assistantMsg: CoreMessage = {
			role: "assistant",
			content: content?.text ?? "",
		};
		if (d.leading_choice != null) {
			return [{ role: "user", content: d.leading_choice }, assistantMsg];
		} else {
			return [assistantMsg];
		}
	});

	return previousScenarios;
}
