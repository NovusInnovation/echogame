import { MotiText } from "moti";
import { StyleProp, Text, TextStyle, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { ClientScenario } from "~/lib/types/game";

const OptionText = ({
  children,
  className = "",
  translationX,
  isLeft = false,
}: {
  children: React.ReactNode;
  className?: string;
  translationX: SharedValue<number>;
  isLeft?: boolean;
}) => {

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: isLeft
        ? Math.max(0, Math.min(1, 0.5 - (translationX.value / 300)))
        : Math.max(0, Math.min(1, 0.5 + (translationX.value / 300))),
    };	
  });

  return (
    <Animated.Text
      className={`text-foreground max-w-[50%] text-xl font-mono ${className}`}
      style={animatedStyle}
    >
      {children}
    </Animated.Text>
  );
};

type OptionsProps = {
  card: ClientScenario;
  translationX: SharedValue<number>;
};

export function Options({ card, translationX }: OptionsProps) {
  return (
    <View className="-z-[1]">
      <View className="py-2 absolute flex flex-row w-full justify-between">
        <OptionText translationX={translationX} isLeft={true}>{card.optionA.text}</OptionText>
        <OptionText className="text-right" translationX={translationX}>{card.optionB.text}</OptionText>
      </View>
    </View>
  );
}
