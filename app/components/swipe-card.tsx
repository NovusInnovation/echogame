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
import { memo, useEffect, useMemo, useRef } from 'react';

interface Card {
    title: string;
    description: string;
}

interface SwipeCardProps {
    card: Card;
    index: number;
    totalCards: number;
    onDismiss: (direction: 'left' | 'right') => void;
    // isAnimating: boolean;
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
}

const SWIPE_SPRING_CONFIG =
{
    stiffness: 50,
    damping: 40
}


export default memo(SwipeCard);

function SwipeCard({ card, index, totalCards, onDismiss, setIsAnimating }: SwipeCardProps) {
    const { width } = useWindowDimensions();
    const translateX = useSharedValue(0);
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
        })
        .onEnd((event) => {
            const predictedX = event.velocityX / 2 + event.translationX;
            const predictedY = event.velocityY / 2 + event.translationY;
            console.log(event.velocityX, event.velocityY, predictedX, predictedY);
            if (Math.abs(event.velocityX) > VELOCITY_THRESHOLD && Math.abs(predictedX) > SWIPE_THRESHOLD) {
                const dis = Math.sqrt(predictedX ** 2 + predictedY ** 2) / 1000;

                const direction = translateX.value > 0 ? 'right' : 'left';
                runOnJS(setIsAnimating)(true);


                translateX.value = withSpring(predictedX / dis, {
                    ...SWIPE_SPRING_CONFIG,
                    velocity: event.velocityX
                });
                translateY.value = withSpring(predictedY / dis, {
                    ...SWIPE_SPRING_CONFIG,
                    velocity: event.velocityY,
                });
                runOnJS(() => setTimeout(() => {
                    onDismiss(direction);
                }, 500))();

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
                    1 - (index * 0.05) + (isPressed.value ? 0.1 : 0),
                ),
            },

        ],
    }));


    return (
        <GestureDetector gesture={gesture}>
            <MotiView
                className="absolute w-full bg-background rounded-lg shadow-lg p-6"
                style={[
                    animatedStyle,

                    { zIndex: totalCards - index, backgroundColor: index === 0 ? 'red' : "white" }
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