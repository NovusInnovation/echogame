import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { z } from 'zod';
import Config from 'react-native-config';

// Set up Supabase Client
const supabaseUrl = Config.SUPABASE_URL;
const supabaseKey = Config.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI Model Setup
const OPENAI_API_KEY = Config.OPENAI_API_KEY;
const SYSTEMPROMPT = "Create a brief current event scenario (2-3 sentences) for a country leadership game..."; // Your SYSTEMPROMPT

const OPENAI_MODEL = "gpt-4o-2024-08-06";

// Function to generate the next scenario
async function generateScenario(messages) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', 
      {
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEMPROMPT },
          ...messages,
        ]
      }, 
      { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` } }
    );
    return response.data.choices[0].message.content; // Adjust according to OpenAI response format
  } catch (error) {
    console.error("Error generating scenario", error);
  }
}

// Fetch previous scenarios from Supabase
async function getPreviousScenarios(startId) {
  const { data, error } = await supabase
    .from('cards')
    .select('id, leading_choice, content')
    .eq('parent', startId);
  
  if (error) throw error;

  return data.map(d => ({
    role: d.leading_choice ? 'user' : 'assistant',
    content: d.content?.text || ''
  }));
}

// Function to handle the scenario expansion logic
async function expandScenario(scenarioToExpand) {
  try {
    const previousScenarios = await getPreviousScenarios(scenarioToExpand);

    const newScenarioMessages = [
      ...previousScenarios,
      { role: 'user', content: 'new choice' }, // Example leading choice
    ];

    const newScenario = await generateScenario(newScenarioMessages);

    // Insert the new scenario into the database
    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          parent: scenarioToExpand,
          leading_choice: 'Option A',
          content: { text: newScenario }
        }
      ]);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error expanding scenario", error);
  }
}

// Example usage: Call this to expand a scenario
expandScenario(123); // Pass the ID of the scenario you want to expand
