import { Text, View } from "react-native";
import { ClientScenario } from "~/lib/types/game";

type OptionsProps = {
	card: ClientScenario;
};

export function options({ card }: OptionsProps) {
	return (
		<>
			<View className="flex justify-between">
				<Text>{card.optionA.text}</Text>
				<Text>{card.optionB.text}</Text>
			</View>
		</>
	);
}
