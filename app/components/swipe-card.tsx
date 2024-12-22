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

export default memo(SwipeCard);

function SwipeCard({ card, index, totalCards, onDismiss, setIsAnimating }: SwipeCardProps) {
    const { width } = useWindowDimensions();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    translateX.addListener(1, (value) => {
        console.log(value);
    });
    const SWIPE_THRESHOLD = width * 0.4;
    let testingNum = useRef(0);

    useEffect(() => {
        console.log("mounted");
        return () => {
            console.log("unmounted");
        };
    }, []);

    const gesture = Gesture.Pan()
        .onStart(() => { console.log('start') })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY / (1 + Math.abs(event.translationY) / 100);
        })
        .onEnd((event) => {
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                testingNum.current++;
                console.log(testingNum);
                const direction = translateX.value > 0 ? 'right' : 'left';
                runOnJS(setIsAnimating)(true);
                translateX.value = withSpring(direction === 'right' ? width / 100 : -width, {

                    stiffness: 10,
                    velocity: event.velocityX,
                    damping: 15,

                }, () => {
                    runOnJS(onDismiss)(direction);
                });
                translateY.value = withSpring(-100, { damping: 250 });
            } else {
                console.log('reset');
                translateX.value = withSpring(0, { damping: 15, velocity: event.velocityX });
                translateY.value = withSpring(0, { damping: 15, velocity: event.velocityY });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value + index * 8 },
            { rotate: `${translateX.value / 10}deg` },
            {
                scale: withTiming(
                    1 - (index * 0.05)
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