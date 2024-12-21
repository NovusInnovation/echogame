import { Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: keyof typeof TYPE_CLASSES;
};

const TYPE_CLASSES = {
  default: "text-base leading-6",
  defaultSemiBold: "text-base leading-6 font-semibold",
  title: "text-3xl font-bold leading-8",
  subtitle: "text-2xl font-bold",
  link: "text-base leading-[30px] text-[#0a7ea4]",
} as const;

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const typeClasses = TYPE_CLASSES[type] || TYPE_CLASSES.default;

  return <Text className={typeClasses} style={[{ color }, style]} {...rest} />;
}
