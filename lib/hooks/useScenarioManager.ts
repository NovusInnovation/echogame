import { useState, useEffect } from 'react';
import { supabase } from "~/lib/supabase/client";
import type { ClientScenario } from '~/lib/types/game';

export function useScenarioManager(startingScenarioId: number) {
  const [currentScenario, setCurrentScenario] = useState<ClientScenario | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [nextCard, setNextCard] = useState<ClientScenario | undefined>();
  
  const [choiceScenarios, setChoiceScenarios] = useState<{
    optionA: ClientScenario | undefined;
    optionB: ClientScenario | undefined;
  }>({
    optionA: undefined,
    optionB: undefined,
  });

  const generateScenario = async (scenarioId: number) => {
    const { data } = await supabase.functions.invoke("generateScenario", {
      body: { scenarioId },
    });
    return data.data;
  };

  const prefetchNextScenarios = async (scenario: ClientScenario) => {
    for (const key of ["optionA", "optionB"] as const) {
      const nextScenario = await generateScenario(scenario[key].id);
      console.log(nextScenario)
      setChoiceScenarios(prev => ({
        ...prev,
        [key]: nextScenario,
      }));
    }
  };

  const initializeScenario = async () => {
    try {
      setIsLoading(true);
      const generatedScenario = await generateScenario(startingScenarioId);
      setCurrentScenario(generatedScenario);
      await prefetchNextScenarios(generatedScenario);
    } catch (error) {
      console.error("Failed to load scenario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeScenario();
  }, []);

  return {
    currentScenario,
    setCurrentScenario,
    isLoading,
    choiceScenarios,
    nextCard,
    setNextCard,
  };
} 