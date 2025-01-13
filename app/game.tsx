import { View, ActivityIndicator, Text } from "react-native";
import SwipeCard from "./components/swipe-card";
import { useEffect } from "react";
import { useScenarioManager } from "~/lib/hooks/useScenarioManager";
import { Options } from "./components/options";
import { useFonts, SpaceMono_400Regular } from "@expo-google-fonts/space-mono";

const STARTING_SCENARIO_ID = 5;

export default function GameScreen() {
  let [fontsLoaded] = useFonts({
    SpaceMono_400Regular,
  });

  const {
    currentScenario,
    choiceScenarios,
    nextCard,
    isAnimating,
    cards,
    handleDismiss,
    setMainTranslateX,
    isLoading,
    mainTranslateX,
  } = useScenarioManager(STARTING_SCENARIO_ID);

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
      setTranslateX={index == 0 && setMainTranslateX}
      index={index - (isAnimating ? 1 : 0)}
      onDismiss={handleDismiss}
      choiseScenarios={choiceScenarios}
    />
  ));

  if (!fontsLoaded || isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="w-full max-w-sm">
        <View className="w-full max-w-sm h-[25rem] z-auto">
          {cardComponents}
        </View>
        {currentScenario && (
          <Options
            translationX={mainTranslateX}
            card={currentScenario!}
          />
        )}
      </View>
    </View>
  );
}
