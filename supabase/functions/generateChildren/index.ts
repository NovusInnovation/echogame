import React from 'react';
import { View, Text, Button } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import Constants from 'expo-constants';

// Environment variables from expo constants
const { SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY } = Constants.manifest.extra;

// Supabase setup
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// OpenAI API setup
const SYSTEMPROMPT =
  "Create a brief current event scenario (2-3 sentences) for a country leadership game. The user is the leader of a country, that is going downhill. Then provide exactly 2 response options, each between 1-4 words (these should be SUPER short). The response options should present different approaches to handling the situation. The below scenarios are the previous scenarios, Generate the NEXT scenario based on the previous scenario";

const OPENAI_MODEL = "gpt-4o-2024-08-06";

// Generate new scenario function
async function generateScenario(messages) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: SYSTEMPROMPT },
          ...messages,
        ],
      },
      { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` } }
    );
    return response.data.choices[0].message.content; // Adjust according to OpenAI response format
  } catch (error) {
    console.error("Error generating scenario:", error);
    throw new Error('Error generating scenario');
  }
}

// Fetch previous scenarios from Supabase
async function getPreviousScenarios(startId) {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, leading_choice, content')
      .eq('parent', startId);

    if (error) throw error;

    return data.map(d => ({
      role: d.leading_choice ? 'user' : 'assistant',
      content: d.content?.text || ''
    }));
  } catch (error) {
    console.error("Error fetching previous scenarios:", error);
    throw new Error('Error fetching previous scenarios');
  }
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
          content: { text: newScenario },
        },
      ]);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error expanding scenario:", error);
    return null;
  }
}

export default function App() {
  // Explicitly typing the state
  const [scenario, setScenario] = React.useState<{ content: { text: string } }[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleGenerateScenario = async () => {
    setLoading(true);
    const result = await expandScenario(123); // Pass the ID of the scenario you want to expand
    setScenario(result);
    setLoading(false);
  };
/* 
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Generate Scenario" onPress={handleGenerateScenario} />
      {loading && <Text>Loading...</Text>}
      {scenario ? (
        <Text>
          Generated Scenario: {scenario[0]?.content?.text || 'No scenario generated'}
        </Text>
      ) : (
        !loading && <Text>No scenario generated yet.</Text>
      )}
    </View>
  );
  */
}
