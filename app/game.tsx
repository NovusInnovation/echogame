import { Text, View } from "react-native";
import SwipeCard from "./components/swipe-card";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScenarioManager } from "~/lib/hooks/useScenarioManager";
import { Options } from "./components/options";
import { useSharedValue } from "react-native-reanimated";

const STARTING_SCENARIO_ID = 5;

export default function GameScreen() {
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

	const handleDismiss = useCallback(
		(direction: "optionA" | "optionB") => {
			setIsAnimating(true);
			console.log(`Card swiped ${direction}`);

			setTimeout(() => {
				setIsAnimating(false);
				setCards((prevCards) => [
					...prevCards.slice(1),
					prevCards.length + prevCards[0] + 1,
				]);
				setCurrentScenario(nextCard);
				console.log(nextCard);
			}, 400);
		},
		[nextCard]
	);

	let [mainTranslateX, setMainTranslateX] = useState(useSharedValue(0));

	useEffect(() => {
		console.log(mainTranslateX);
	}, [mainTranslateX]);

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
			setTranslateX={
				index == 0 &&
				((t) => {
					setMainTranslateX(t);
				})
			}
			index={index - (isAnimating ? 1 : 0)}
			totalCards={cards.length}
			onDismiss={handleDismiss}
			choiseScenarios={choiceScenarios}
			setNextCard={setNextCard}
		/>
	));

	return (
		<View className="flex-1 justify-center items-center p-6">
			<View className="w-full max-w-sm">
				<View className="w-full max-w-sm h-[20rem]">{cardComponents}</View>
				{currentScenario && <Options card={currentScenario!} />}
			</View>
		</View>
	);
}
