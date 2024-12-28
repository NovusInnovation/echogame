import { Text, View } from "react-native";
import { ClientScenario } from "~/lib/types/game";

type OptionsProps = {
	card: ClientScenario;
};

export function Options({ card }: OptionsProps) {
	return (
		<View className="flex flex-row w-full justify-between bg-blue -z-[1]">
			<Text className="text-foreground max-w-[50%]">{card.optionA.text}</Text>
			<Text className="text-foreground max-w-[50%] text-right">
				{card.optionB.text}
			</Text>
		</View>
	);
}
