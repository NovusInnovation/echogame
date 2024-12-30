import { MotiText } from "moti";
import { StyleProp, Text, TextStyle, View } from "react-native";
import { ClientScenario } from "~/lib/types/game";

const OptionText = ({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) => (
	<MotiText
		className={`text-foreground max-w-[50%] text-xl ${className}`}
		style={{ fontFamily: "SpaceMono_400Regular" }}
		from={{ opacity: 0 }}
		animate={{ opacity: 1 }}
	>
		{children}
	</MotiText>
);

type OptionsProps = {
	card: ClientScenario;
};

export function Options({ card }: OptionsProps) {
	return (
		<View className="-z-[1]">
			<View className="py-2 absolute flex flex-row w-full justify-between bg-blue">
				<OptionText>{card.optionA.text}</OptionText>
				<OptionText className="text-right">{card.optionB.text}</OptionText>
			</View>
		</View>
	);
}
