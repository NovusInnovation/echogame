import { useWindowDimensions } from 'react-native';
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
} from 'react-native-reanimated';
import { memo, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { MutableRefObject } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { ClientScenario } from '../game';
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
    choiseScenarios: MutableRefObject<{
        optionA: ClientScenario | undefined;
        optionB: ClientScenario | undefined;
    }>;
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

    useEffect(() => {
        if (index >= 0) {
            translateX.addListener(1, (value) => {
                if (!(choiseScenarios.current.optionA && choiseScenarios.current.optionB)) {
                    console.log("whwhwh")
                }                // console.log(nextScenario);

            });
        }
        else {
            translateX.removeListener(1);
        }
    }, [index]);
    const translateY = useSharedValue(index * 8);
    const isPressed = useSharedValue(false);

    const SWIPE_THRESHOLD = width * 0.4;
    const VELOCITY_THRESHOLD = 100;


    useEffect(() => {
        if (index >= 0) {
            translateY.value = withSpring(index * 8, { damping: 15 });
        }
    }, [index]);

    const gesture = Gesture.Pan()
        .onBegin(() => { isPressed.value = true; })

        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY / (1 + Math.abs(event.translationY) / 200);

            const nextScenario = event.translationX < 0 ? choiseScenarios.current.optionA : choiseScenarios.current.optionB;

            setNextCard(nextScenario);
        })
        .onEnd((event) => {
            const predictedX = event.velocityX / 2 + event.translationX;
            const predictedY = event.velocityY / 2 + event.translationY;
            const direction = predictedX > 0 ? 'optionA' : 'optionB';
            console.log(event.velocityX, event.velocityY, predictedX, predictedY);
            if (Math.abs(event.velocityX) > VELOCITY_THRESHOLD && Math.abs(predictedX) > SWIPE_THRESHOLD && choiseScenarios.current[direction]) {
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



                // runOnJS(fun)();
            } else {
                console.log('reset');
                translateX.value = withSpring(0, { damping: 15, velocity: event.velocityX });
                translateY.value = withSpring(0, { damping: 15, velocity: event.velocityY });
            }
        })
        .onFinalize(() => { isPressed.value = false; });


    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${translateX.value / 10}deg` },
            {
                scale: withTiming(
                    1 - (index * 0.05) + (isPressed.value ? 0.05 : 0),
                ),
            },

        ],
    }));


    return (
        <GestureDetector gesture={gesture}>
            <MotiView
                className="absolute h-full w-full bg-background rounded-lg shadow-lg p-6"
                style={[
                    animatedStyle,

                    { zIndex: totalCards - index }
                ]}
            >
                <Text className="text-2xl font-bold mb-4">{card.title}</Text>
                <Text className="text-foreground/70 mb-4">
                    {card.description}
                </Text>
            </MotiView>
        </GestureDetector>
    );
} 