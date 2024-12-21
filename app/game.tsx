import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import SwipeCard from './components/swipe-card';

// Card data type
type Card = {
    id: number;
    title: string;
    description: string;
};

export default function GameScreen() {

    const [isAnimating, setIsAnimating] = React.useState(false);
    // Add sample cards
    const [cards, setCards] = React.useState<Card[]>([
        { id: 1, title: "Card 1", description: "Swipe me left or right!" },
        { id: 2, title: "Card 2", description: "I'm next in line!" },
        { id: 3, title: "Card 3", description: "Wait for your turn!" },
    ]);

    // Memoize the card components
    const cardComponents = React.useMemo(() => (
        cards.map((card, index) => (
            <SwipeCard
                key={card.id}
                card={card}
                index={index}
                totalCards={cards.length}
                onDismiss={handleDismiss}
                setIsAnimating={setIsAnimating}
            />
        ))
    ), [cards]); // Only re-create when cards array changes

    const handleDismiss = (direction: 'left' | 'right') => {
        console.log(`Card swiped ${direction}`);
        setIsAnimating(false);

    };

    return (
        <View className="flex-1 justify-center items-center p-6 bg-secondary/30">
            <View className="w-full max-w-sm">
                {cardComponents}
            </View>

            < Button
                variant="outline"
                className="shadow shadow-foreground/5 mt-40"
                onPress={() => router.back()}
            >
                <Text>Go Back</Text>
            </Button>
            {/* <Text>Animating: {isAnimating ? 'Yes' : 'No'}</Text> */}
        </View>
    );
} 