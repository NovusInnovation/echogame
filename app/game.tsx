import { View } from "react-native";
import SwipeCard from "./components/swipe-card";
import { useState } from "react";
import { useScenarioManager } from "~/hooks/useScenarioManager";

const STARTING_SCENARIO_ID = 5;

export default function GameScreen() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [cards, setCards] = useState<number[]>([1, 2, 3]);

  const {
    currentScenario,
    isLoading,
    choiceScenarios,
    nextCard,
    setNextCard,
  } = useScenarioManager(STARTING_SCENARIO_ID);

  const handleDismiss = (direction: "optionA" | "optionB") => {
    setIsAnimating(true);
    console.log(`Card swiped ${direction}`);

    setTimeout(() => {
      setIsAnimating(false);
      setCards((prevCards) => prevCards.slice(1));
      setCurrentScenario(nextCard!);
    }, 400);
  };

  const cardComponents = cards.map((card, index) => (
    <SwipeCard
      key={card}
      card={{
        title: `Card ${card}`,
        description:
          index === 0 ? currentScenario?.situation ?? "." : nextCard?.situation ?? ".",
      }}
      index={index - (isAnimating ? 1 : 0)}
      totalCards={cards.length}
      onDismiss={handleDismiss}
      choiseScenarios={choiceScenarios}
      setNextCard={setNextCard}
    />
  ));

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-6 bg-secondary/30">
      <View className="w-full max-w-sm h-[20rem]">{cardComponents}</View>
    </View>
  );
}
