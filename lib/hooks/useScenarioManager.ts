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
  const [currentScenario, setCurrentScenario] = useState<
    ClientScenario | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [nextCard, setNextCard] = useState<ClientScenario | undefined>();
  const [isAnimating, setIsAnimating] = useState(false);
  const [cards, setCards] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [choiceScenarios, setChoiceScenarios] = useState<{
    optionA: ClientScenario | undefined;
    optionB: ClientScenario | undefined;
  }>({ optionA: undefined, optionB: undefined });

  const generateScenario = async (scenarioId: number) => {
    const { data } = await supabase.functions.invoke("generateScenario", {
      body: { scenarioId },
    });
    return data.data;
  };

  const handleDismiss = useCallback(() => {
    setIsAnimating(true);
    console.log(`Card swiped`);

    setTimeout(() => {
      setIsAnimating(false);
      setCards((prevCards) => [
        ...prevCards.slice(1),
        prevCards.length + prevCards[0] + 1,
      ]);
      setCurrentScenario(nextCard);
      console.log(nextCard);
    }, 400);
  }, [nextCard]);

  const [mainTranslateX, setMainTranslateX] = useState(useSharedValue(0));

  const handleSetTranslateX = useCallback(
    (t: SetStateAction<SharedValue<number>>) => {
      setMainTranslateX(t);
    },
    []
  );

  useAnimatedReaction(
    () => mainTranslateX.value,
    (translateX) => {
      const nextScenario =
        translateX < 0 ? choiceScenarios.optionA : choiceScenarios.optionB;
      runOnJS(setNextCard)(nextScenario);
    }
  );

  const prefetchNextScenarios = async (scenario: ClientScenario) => {
    for (const key of ["optionA", "optionB"] as const) {
      const nextScenario = await generateScenario(scenario[key].id);
      console.log(nextScenario);
      setChoiceScenarios((prev) => ({ ...prev, [key]: nextScenario }));
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
    choiceScenarios,
    nextCard,
    isAnimating,
    cards,
    handleDismiss,
    handleSetTranslateX,
    isLoading,
  };
}
