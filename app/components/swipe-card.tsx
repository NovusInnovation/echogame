import { useWindowDimensions, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { MotiView } from 'moti';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    withDelay,
} from 'react-native-reanimated';
import { memo, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { MutableRefObject } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { ClientScenario } from '~/lib/types/game';
import { ChoiceOptions } from '~/src-old/app/game/components/ChoiceOptions';

interface Card {
    title: string;
    description: string;
}

type SwipeCardProps = {
    card: { title: string; description: string };
    index: number;
    totalCards: number;
    onDismiss: (direction: "optionA" | "optionB") => void;
    choiseScenarios: {
        optionA: ClientScenario | undefined;
        optionB: ClientScenario | undefined;
    };
    setNextCard: (scenario: ClientScenario | undefined) => void;
};

const SWIPE_SPRING_CONFIG =
{
    stiffness: 50,
    damping: 40
}


export default memo(SwipeCard);

function SwipeCard({ card, index, totalCards, onDismiss, choiseScenarios, setNextCard }: SwipeCardProps) {
    const { width } = useWindowDimensions();

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(index * 18);
    const isPressed = useSharedValue(false);
    const opacity = useSharedValue(0);

    const SWIPE_THRESHOLD = width * 0.4;
    const VELOCITY_THRESHOLD = 100;

    useEffect(() => {
        if (index >= 0) {
            translateY.value = withSpring(index * 18, { damping: 15 });
        }
    }, [index]);

    const gesture = useMemo(() => {
        if (index !== 0) return Gesture.Pan().enabled(false);

        return Gesture.Pan()
            .onBegin(() => { isPressed.value = true; })
            .onUpdate((event) => {
                translateX.value = event.translationX;
                translateY.value = event.translationY / (1 + Math.abs(event.translationY) / 200);

                const nextScenario = event.translationX < 0 ? choiseScenarios.optionA : choiseScenarios.optionB;
                runOnJS(setNextCard)(nextScenario);
            })
            .onEnd((event) => {
                const predictedX = event.velocityX / 2 + event.translationX;
                const predictedY = event.velocityY / 2 + event.translationY;
                const direction = predictedX > 0 ? 'optionA' : 'optionB';
                console.log(event.velocityX, event.velocityY, predictedX, predictedY);
                if (Math.abs(event.velocityX) > VELOCITY_THRESHOLD && Math.abs(predictedX) > SWIPE_THRESHOLD && choiseScenarios[direction]) {
                    const dis = Math.sqrt(predictedX ** 2 + predictedY ** 2) / 1000;

                    runOnJS(onDismiss)(direction);

                    translateX.value = withSpring(predictedX / dis, {
                        ...SWIPE_SPRING_CONFIG,
                        velocity: event.velocityX
                    });
                    translateY.value = withSpring(predictedY / dis, {
                        ...SWIPE_SPRING_CONFIG,
                        velocity: event.velocityY,
                    });
                } else {
                    console.log('reset');
                    translateX.value = withSpring(0, { damping: 15, velocity: event.velocityX });
                    translateY.value = withSpring(0, { damping: 15, velocity: event.velocityY });
                }
            })
            .onFinalize(() => { isPressed.value = false; });
    }, [index, choiseScenarios, setNextCard]);

    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));
    useEffect(() => {
        opacity.value = withTiming(1 - index * 0.1, { duration: 500 });
    }, [index]);
    const animatedStyle = useAnimatedStyle(() => ({

        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${translateX.value / 10}deg` },
            {
                scale: withTiming(
                    0.95 ** index + (isPressed.value ? 0.05 : 0),
                ),
            },
        ],
    }));


    return (
        <GestureDetector gesture={gesture}>
            <MotiView
                className="absolute h-full w-full rounded-lg bg-background"
                style={[
                    animatedStyle,
                    { zIndex: totalCards - index }
                ]}
            >
                <Animated.View
                    className='p-6 h-full w-full rounded-lg bg-card transition-shadow duration-200'
                    style={[
                        opacityStyle,
                        {
                            elevation: 5, // for Android
                        }
                    ]}
                >
                    <Text className="text-2xl font-bold mb-4">{card.title}</Text>
                    <Text className="text-foreground/70 mb-4">
                        {card.description}
                    </Text>
                </Animated.View>
            </MotiView>
        </GestureDetector>
    );
} 