"use client"

import { z } from "zod";
import { createClient } from "../../lib/supabase/client";
import { useState } from "react";

export default function Page() {
	const [data, setData] = useState(null);
	const responseSchema = z.object({
		situation: z.string(),
		optionA: z.string(),
		optionB: z.string(),
	});

	const supabase = createClient();

	supabase.functions.invoke("generateScenario", {
		body: JSON.stringify({
			messages: [
				{
					role: "user",
					content:
						"A severe drought has crippled your nation's agriculture, causing widespread food shortages. International aid is available but requires the removal of key environmental regulations.",
				},
			],
		}),
	}).then((object) => {
		if (!object.data) return
		responseSchema.parse(object.data)
		setData(object.data)
	});

	return (
		<>
		{ data && (
			<div>
				<p>Situation: {data.situation}</p>
				<p>Choice A: {data.optionA}</p>
				<p>Choice B: {data.optionB}</p>
			</div>
			)}
			Hey
		</>
  );
};
