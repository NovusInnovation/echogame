import { useState, useEffect, SetStateAction, useCallback } from "react";
import {
  SharedValue,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { supabase } from "~/lib/supabase/client";
import type { ClientScenario } from "~/lib/types/game";

export function useScenarioManager(startingScenarioId: number) {
  // State to hold the current scenario
  const [currentScenario, setCurrentScenario] = useState<ClientScenario | undefined>();
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false);
  // State to hold the next card scenario
  const [nextCard, setNextCard] = useState<ClientScenario | undefined>();
  // State to track animation status
  const [isAnimating, setIsAnimating] = useState(false);
  // State to hold the list of card IDs
  const [cards, setCards] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  // State to hold the choice scenarios for options A and B
  const [choiceScenarios, setChoiceScenarios] = useState<{
    optionA: ClientScenario | undefined;
    optionB: ClientScenario | undefined;
  }>({ optionA: undefined, optionB: undefined });

  // Function to generate a scenario based on the scenario ID
  const generateScenario = async (scenarioId: number) => {
    const { data } = await supabase.functions.invoke("generateScenario", {
      body: { scenarioId },
    });
    return data.data;
  };

  // Handler for dismissing a card
  const handleDismiss = (direction: keyof typeof choiceScenarios) => {
    setIsAnimating(true);
    console.log(`Card swiped`);
    const chosenCard = choiceScenarios[direction]!;  
    console.log(chosenCard);
    prefetchNextScenarios(chosenCard);
    setNextCard(chosenCard);

    setTimeout(() => {
      setIsAnimating(false);
      setCards((prevCards) => [
        ...prevCards.slice(1),
        prevCards.length + prevCards[0] + 1,
      ]);
      setCurrentScenario(chosenCard);
      console.log("Updated current scenario:", chosenCard);
    }, 400);
  };

  // State to hold the main translate X value
  const [mainTranslateX, setMainTranslateX] = useState(useSharedValue(0));

  // Reaction to changes in the main translate X value
  useAnimatedReaction(
    () => mainTranslateX.value,
    (translateX) => {
      if(isAnimating) return
      const nextScenario =
        translateX < 0 ? choiceScenarios.optionA : choiceScenarios.optionB;
      runOnJS(setNextCard)(nextScenario);
    }
  );

  // Function to prefetch the next scenarios for options A and B
  const prefetchNextScenarios = async (scenario: ClientScenario) => {
    for (const key of ["optionA", "optionB"] as const) {
      setChoiceScenarios((prev) => ({ ...prev, [key]: undefined }));
      const nextScenario = await generateScenario(scenario[key].id);
      console.log("Fetched next scenario:", key, nextScenario);
      setChoiceScenarios((prev) => ({ ...prev, [key]: nextScenario }));
    }
  };

  // Function to initialize the scenario
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

  // Effect to initialize the scenario on component mount
  useEffect(() => {
    initializeScenario();
  }, []);

  return {
    currentScenario,
    choiceScenarios,
    nextCard,
    isAnimating,
    cards,
    handleDismiss,
    mainTranslateX,
    setMainTranslateX,
    isLoading
  };
}
