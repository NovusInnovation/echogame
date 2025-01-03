import { Text, View } from "react-native";
import SwipeCard from "./components/swipe-card";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useScenarioManager } from "~/lib/hooks/useScenarioManager";
import { Options } from "./components/options";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { useFonts, SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import { ClientScenario } from "~/lib/types/game";

const STARTING_SCENARIO_ID = 5;

export default function GameScreen() {
  let [fontsLoaded] = useFonts({
    SpaceMono_400Regular,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [cards, setCards] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const {
    currentScenario,
    setCurrentScenario,
    isLoading,
    choiceScenarios,
    nextCard,
    setNextCard,
  } = useScenarioManager(STARTING_SCENARIO_ID);

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

  let [mainTranslateX, setMainTranslateX] = useState(useSharedValue(0));

  useEffect(() => {
    console.log(mainTranslateX);
  }, [mainTranslateX]);

  const handleSetNextCard = useCallback(
    (card: SetStateAction<ClientScenario | undefined>) => {
      setNextCard(card);
    },
    [setNextCard]
  );

  const handleSetTranslateX = useCallback(
    (t: SetStateAction<SharedValue<number>>) => {
      setMainTranslateX(t);
    },
    []
  );

  const cardComponents = cards.map((card, index) => (
    <SwipeCard
      key={card}
      card={{
        title: `Card ${card}`,
        description:
          index === 0
            ? currentScenario?.situation ?? "."
            : nextCard?.situation ?? ".",
      }}
      setTranslateX={index == 0 ? handleSetTranslateX : false}
      index={index - (isAnimating ? 1 : 0)}
      totalCards={cards.length}
      onDismiss={handleDismiss}
      choiseScenarios={choiceScenarios}
      setNextCard={handleSetNextCard}
    />
  ));

  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="w-full max-w-sm">
        <View className="w-full max-w-sm h-[25rem] z-auto">
          {cardComponents}
        </View>
        {currentScenario && <Options card={currentScenario!} />}
      </View>
    </View>
  );
}
