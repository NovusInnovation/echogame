import { View, useWindowDimensions } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { router } from "expo-router";
import SwipeCard from "./components/swipe-card";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "~/lib/supabase/client";

// Card data type
type ClientScenario = {
  situation: string;
  optionA: { text: string; id: number };
  optionB: { text: string; id: number };
};

const STARTING_SCENARIO_ID = 5;

export default function GameScreen() {
  const [isAnimating, setIsAnimating] = useState(false);
  // Add sample cards
  const [cards, setCards] = useState<number[]>([1, 2, 3]);

  const [MainCardContent, setMainCardContent] = useState(
    "This is the first card"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<ClientScenario | null>(
    null
  );
  const choiseScenarios = useRef({
    optiosA: null,
    optionB: null,
  });

  useEffect(() => {
    const initializeScenario = async () => {
      try {
        const { data } = await supabase.functions.invoke("generateScenario", {
          body: { scenarioId: STARTING_SCENARIO_ID },
        });

        const generatedScenario: ClientScenario = data.data;
        (["optionA", "optionB"] as const).map((key) => {
          console.log(generatedScenario[key].id);
          supabase.functions
            .invoke("generateScenario", {
              body: { scenarioId: generatedScenario[key].id },
            })
            .then((s) => {
              console.log(key);
              console.log(s.data.data);
              choiseScenarios.current = {
                ...choiseScenarios.current,
                [key]: s.data.data,
              };
            });
        });
        console.log(generatedScenario);
        setCurrentScenario(generatedScenario);

        // // Prefetch the next two scenarios

        // );
      } catch (error) {
        console.error("Failed to load scenario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeScenario();
  }, []); // Empty dependency array means this runs once on mount

  const handleDismiss = (direction: "left" | "right") => {
    setIsAnimating(true);
    console.log(`Card swiped ${direction}`);
    setTimeout(() => {
      // The animation should be stopped after 400ms
      setIsAnimating(false);
      // Remove card which was swiped
      setCards((prevCards) => prevCards.slice(1));
    }, 400);
  };
  const cardComponents = useMemo(
    () => {
      // Memoize the card components

      return cards.map((card, index) => (
        <SwipeCard
          key={card}
          card={{
            title: `Card ${card}`,
            description:
              index === 0 ? MainCardContent : `Description for card ${card}`,
          }}
          index={index - (isAnimating ? 1 : 0)}
          totalCards={cards.length}
          onDismiss={handleDismiss}
          setIsAnimating={setIsAnimating}
        />
      ));
    },
    [cards, isAnimating] // Add dependencies array
  );

  return (
    <View className="flex-1 justify-center items-center p-6 bg-secondary/30">
      <View className="w-full max-w-sm">{cardComponents}</View>
      <Button
        variant="outline"
        className="shadow shadow-foreground/5 mt-40"
        onPress={() => router.back()}
      >
        <Text>Go Back</Text>
      </Button>
      {/* <Text>Animating: {isAnimating ? 'Yes' : 'No'}</Text> */}
    </View>
  );
}
