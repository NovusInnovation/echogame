import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from 'react-native-reanimated';

export default function GameScreen() {
    const { width, height } = useWindowDimensions();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY / (1 + Math.abs(event.translationY) / 100);
        })
        .onEnd(() => {
            translateX.value = withSpring(0, { damping: 15 });
            translateY.value = withSpring(0, { damping: 15 });
        });

    const animatedStyle = useAnimatedStyle(() => {
        // Calculate rotation based on position


        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${translateX.value / 10}deg` },
            ],
        };
    });

    return (
        <View className="flex-1 justify-center items-center p-6 bg-secondary/30">
            <GestureDetector gesture={gesture}>
                <MotiView
                    className="w-full max-w-sm bg-background rounded-lg shadow-lg p-6 mb-6"
                    animate={{ scale: 1 }}
                    from={{ scale: 0.9 }}
                    style={animatedStyle}
                >
                    <Text className="text-2xl font-bold mb-4">Game Screen</Text>
                    <Text className="text-foreground/70 mb-4">
                        Drag this card and watch it tilt and spring back!
                    </Text>
                </MotiView>
            </GestureDetector>

            <Button
                variant="outline"
                className="shadow shadow-foreground/5"
                onPress={() => router.back()}
            >
                <Text>Go Back</Text>
            </Button>
        </View>
    );
} 