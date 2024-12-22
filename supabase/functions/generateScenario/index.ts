import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";
import { CoreMessage, GenerateObjectResult } from "npm:ai";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateObject } from "npm:ai";
import { z } from "npm:zod";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { corsHeaders } from "../_shared/cors.ts";

const SYSTEMPROMPT =
	"Create a brief current event scenario (2-3 sentences) for a country leadership game. The user is the leader of a country, that is going downhill. Then provide exactly 2 response options, each between 1-4 words (these should be SUPER short). The response options should present different approaches to handling the situation. The below scenarios are the previous scenarios, Generate the NEXT scenario based on the previous scenario";
const OPENAI_MODEL = "gpt-4o-2024-08-06";

const SUPABASE_URL = Deno.env.get("URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY =
	Deno.env.get("SERVICE_ROLE_KEY") ??
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
	"";

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: { ...corsHeaders }, status: 200 });
	}
	console.log(Deno.env.get("URL"));
	const { scenarioId } = await req.json();
	// const scenarioId = 17;
	try {
		const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
			global: {
				headers: {
					Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
				},
			},
		});

		const [scenario, previousMessages] = await getScenario(
			supabase,
			scenarioId,
		);

		return new Response(
			JSON.stringify({
				data: scenario,
				previousMessages,
			}),
			{
				headers: { "Content-Type": "application/json", ...corsHeaders },
				status: 200,
			},
		);
	} catch (err) {
		return new Response(String(err?.message ?? err), {
			headers: { ...corsHeaders },
			status: 500,
		});
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
	const previousScenarios: CoreMessage[] = data.flatMap(
		(d: { content: { text: string } | null; leading_choice: string }) => {
			const content = d.content as { text: string } | null;

			const assistantMsg: CoreMessage | { role: string; content: undefined } = {
				role: "assistant",
				content: content?.text,
			};

			const r = [
				{ role: "user", content: d.leading_choice },
				assistantMsg,
			].filter(
				(m) => m.content != undefined || m.content != null,
			) as CoreMessage[];
			return r;
		},
	);

	return previousScenarios;
}

async function getScenario(
	supabase: SupabaseClient<Database>,
	scenarioId: number,
) {
	const mainCardRequest = supabase
		.from("cards")
		.select("*")
		.eq("id", scenarioId)
		.throwOnError()
		.then();

	const choiceCardsRequest = supabase
		.from("cards")
		.select("leading_choice, id")
		.eq("parent", scenarioId)
		.throwOnError()
		.then();

	const { data: mainCards } = await mainCardRequest;

	if (mainCards == null || mainCards.length == 0) {
		throw new Error("Could not find that scenario");
	}

	const scenario = mainCards[0];

	if (scenario.content != null) {
		const { data: optionRows } = await choiceCardsRequest;
		if (!optionRows) {
			throw new Error("No options found for the scenario");
		}
		return [
			clientScenario(
				(scenario.content as { text: string }).text as string,
				optionRows,
			),
			null,
		];
	}

	// If the scenario is NOT already generated
	// We genrate it now

	const previousScenarios = await getPreviousScenarios(supabase, scenarioId);

	const genaration = (await generateScenario(previousScenarios)).object;

	await supabase
		.from("cards")
		.update({
			content: { text: genaration.situation },
		})
		.eq("id", scenarioId);

	const { data: optionRows } = await supabase
		.from("cards")
		.insert([
			{
				parent: scenarioId,
				leading_choice: genaration.optionA,
			},
			{
				parent: scenarioId,
				leading_choice: genaration.optionB,
			},
		])
		.select();

	if (!optionRows) {
		throw new Error("Failed to insert options");
	}
	return [clientScenario(genaration.situation, optionRows), previousScenarios];
}
