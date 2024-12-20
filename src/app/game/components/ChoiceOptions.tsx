import { motion, MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

type ChoiceOptionsProps = {
    currentScenario: {
        optionA: { text: string };
        optionB: { text: string };
    };
    leftOpacity: MotionValue<number>;
    rightOpacity: MotionValue<number>;
    isAnimating: boolean;
};

export function ChoiceOptions({ currentScenario, leftOpacity, rightOpacity, isAnimating }: ChoiceOptionsProps) {

    const [animate, setAnimate] = useState(false);
    useEffect(() => {

        if (!isAnimating) {
            setAnimate(false);
        } else {
            console.log(leftOpacity.get(), rightOpacity.get());
            setTimeout(() => {
                setAnimate(true);
            }, 300);
        }
    }, [isAnimating]);
    return (
        <div className="mt-8 flex flex-row gap-6 font-mono px-0 w-full justify-between md:text-xl z-10">
            <AnimatedChoice
                isAnimating={animate}
                opacity={leftOpacity}
                text={currentScenario?.optionA?.text}
            />
            <AnimatedChoice
                isAnimating={animate}
                opacity={rightOpacity}
                text={currentScenario?.optionB?.text}
            />


        </div>
    );
}
interface AnimatedChoiceProps {
    isAnimating: boolean;
    opacity: MotionValue<number>;
    text: string;
}

export const AnimatedChoice = ({ isAnimating, opacity, text }: AnimatedChoiceProps) => {
    console.log("opa", opacity.get());
    return (
        <motion.h1
            style={isAnimating ? {} : { opacity: opacity }}
            initial={isAnimating ? { opacity: opacity.get() } : { opacity: 0 }}
            animate={isAnimating ? { scale: false ? 1.5 : 1, opacity: 0 } : { opacity: opacity.get() }}
            key={isAnimating ? 1 : 0}
            transition={{
                duration: 0.3,
                ease: [0.4, 0, 1, 1], // Fast-out, slow-in easing

            }}

        >
            {text ?? "\u00A0"}
        </motion.h1>
    );
};
