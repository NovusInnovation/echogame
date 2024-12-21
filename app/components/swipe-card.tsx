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
import { memo, useMemo } from 'react';

interface Card {
    title: string;
    description: string;
}

interface SwipeCardProps {
    card: Card;
    index: number;
    totalCards: number;
    onDismiss: (direction: 'left' | 'right') => void;
    isAnimating: boolean;
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
}

export default memo(SwipeCard);

function SwipeCard({ card, index, totalCards, onDismiss, setIsAnimating }: SwipeCardProps) {
    const { width } = useWindowDimensions();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = width * 0.4;

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY / (1 + Math.abs(event.translationY) / 100);
        })
        .onEnd((event) => {
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                const direction = translateX.value > 0 ? 'right' : 'left';
                runOnJS(setIsAnimating)(true);
                translateX.value = withSpring(direction === 'right' ? width : -width, {

                    stiffness: 100,
                    velocity: event.velocityX,
                    damping: 15,

                }, () => {
                    runOnJS(onDismiss)(direction);
                });
                translateY.value = withSpring(-100, { damping: 250 });
            } else {
                translateX.value = withSpring(0, { damping: 15, velocity: event.velocityX });
                translateY.value = withSpring(0, { damping: 15, velocity: event.velocityY });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${translateX.value / 10}deg` },
            {
                scale: interpolate(
                    Math.abs(translateX.value),
                    [0, SWIPE_THRESHOLD],
                    [1, 0.95],
                    'clamp'
                )
            },
        ],
    }));

    const predictedIndex = Math.max(index - (false ? 1 : 0), 0);

    return (
        <GestureDetector gesture={gesture}>
            <MotiView
                className="absolute w-full bg-background rounded-lg shadow-lg p-6"
                animate={{
                    scale: 1 - (predictedIndex * 0.05),
                    translateY: predictedIndex * 8
                }}
                transition={{
                    type: 'timing',
                    duration: 1000,
                }}
                from={{ scale: 0.2 }}
                style={[
                    animatedStyle,

                    { zIndex: totalCards - index, backgroundColor: predictedIndex === 0 ? 'red' : "white" }
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