"use client";

import { useEffect, useRef, useState } from "react";
import {
	useMotionValue,
	useTransform,
	useAnimation,
	
} from "framer-motion";
import { createClient } from "../../lib/supabase/client";
import { StatusBar } from "./components/StatusBar";
import { CardStack } from "./components/CardStack";
import { ChoiceOptions } from "./components/ChoiceOptions";

const DRAG_THRESHOLD = 200;
const THROW_VELOCITY = 750;

type ClientScenario = {
	situation: string;
	optionA: { text: string; id: number };
	optionB: { text: string; id: number };
};

const clientScenario = (
	situation: string,
	optionRows: { leading_choice: string | null; id: number }[]
) => ({
	situation,
	optionA: { text: optionRows[0].leading_choice, id: optionRows[0].id },
	optionB: { text: optionRows[1].leading_choice, id: optionRows[1].id },
});

const STARTING_SCENARIO_ID = 5;

export default function GameInterface() {
	const [dayCount, setDayCount] = useState(0);
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [stats] = useState({
		nature: 50,
		social: 50,
		military: 50,
		economy: 50,
	});

	const [scenarios, setScenario] = useState([0, 1, 2, 3]);

	const supabase = createClient();

	// supabase.auth.signInAnonymously();

	const [currentScenario, setCurrentScenario] = useState<ClientScenario | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const choiseScenarios = useRef<{
		optionA: ClientScenario | null;
		optionB: ClientScenario | null;
	}>({
		optionA: null,
		optionB: null,
	});

	useEffect(() => {
		const initializeScenario = async () => {
			try {
				const { data } = await supabase.functions.invoke("generateScenario", {
					body: { scenarioId: STARTING_SCENARIO_ID },
				});

				const generatedScenario: ClientScenario = data.data;
				(["optionA", "optionB"] as const).map((key) => {
					console.log(generatedScenario[key].id);
					supabase.functions
						.invoke("generateScenario", {
							body: { scenarioId: generatedScenario[key].id },
						})
						.then((s) => {
							console.log(key);
							console.log(s.data.data);
							choiseScenarios.current = {
								...choiseScenarios.current,
								[key]: s.data.data,
							};
						});
				});
				console.log(generatedScenario);
				setCurrentScenario(generatedScenario);

				// // Prefetch the next two scenarios

				// );
			} catch (error) {
				console.error("Failed to load scenario:", error);
			} finally {
				setIsLoading(false);
			}
		};

		initializeScenario();
	}, []); // Empty dependency array means this runs once on mount

	useEffect(() => {
		console.log(choiseScenarios);
	}, [choiseScenarios]);

	const mainControls = useAnimation();
	const SecondControls = useAnimation();

	// Card motion values
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(
		[x, y],
		([latestX, latestY]) => Number(latestX) * 0.05 + Number(latestY) * 0.05
	);

	const leftOpacity = useTransform(x, [200, 30, -30, -200], [0, 0.7, 0.7, 1]);
	const rightOpacity = useTransform(x, [-200, -30, 30, 200], [0, 0.7, 0.7, 1]);

	const [nextCardContent, setNextCardContent] = useState<string>("");

	const handleDragEnd = async (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: {
			offset: { x: number; y: number };
			velocity: { x: number; y: number };
		}
	) => {
		console.log("offset: ", info.offset.x);
		console.log("velocity: ", info.velocity.x);
		const predictedX = info.offset.x + info.velocity.x;
		const predictedY = info.offset.y + info.velocity.y;

		const offset = Math.sqrt(predictedX ** 2 + (predictedY / 10) ** 2);

		console.log("offset: ", offset);
		const velocity = Math.sqrt(
			info.velocity.x ** 2 + (info.velocity.y / 2) ** 2
		);
		console.log("fetchNextScenario");

		const isSwipingLeft = predictedX < 0;
		const selectedScenario = isSwipingLeft
			? choiseScenarios.current.optionA
			: choiseScenarios.current.optionB;
		setCurrentScenario(selectedScenario);
		setDayCount((prev) => prev + 1); //day count increment


		if (offset > 300 && velocity > 40 && !isAnimating && selectedScenario) {
			setIsAnimating(true);
			const angle = Math.atan2(predictedY, predictedX);
			const throwX = Math.cos(angle) * window.innerWidth * 1.5;
			const throwY = Math.sin(angle) * window.innerHeight * 1.5;

			setScenario([...scenarios, scenarios.length]);

			await mainControls.start({
				x: throwX,
				y: throwY,
				opacity: 0,
				transition: { duration: 1 },
			});



			setCurrentScenario(selectedScenario);

			["optionA", "optionB"].map((key) => {
				choiseScenarios.current = {
					...choiseScenarios.current,
					[key]: null,
				};
				console.log(selectedScenario[key].id);
				supabase.functions
					.invoke("generateScenario", {
						body: { scenarioId: selectedScenario[key].id },
					})
					.then((s) => {
						console.log(key);
						console.log(s.data.data);
						choiseScenarios.current = {
							...choiseScenarios.current,
							[key]: s.data.data,
						};
					});
			});

			setCurrentScenarioIndex((prevIndex) => prevIndex + 1);
			x.set(0);
			y.set(0);

			// Reset card position for next scenario
			setIsAnimating(false);
		} else {
			// Snap back to center
			mainControls.start({
				x: 0,
				y: 0,
				transition: { type: "spring", stiffness: 300, damping: 20 },
			});
		}
	};

	// useEffect(() => {
	// 	mainControls.set({ x: 0, y: 0, opacity: 1 });
	// }, [currentScenario]);

	return (
		<div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
			<StatusBar stats={stats} />

			<div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
				<CardStack
					scenarios={scenarios}
					currentScenarioIndex={currentScenarioIndex}
					isAnimating={isAnimating}
					currentScenario={currentScenario}
					nextCardContent={nextCardContent}
					cardControls={{
						rotate,
						x,
						y,
						mainControls,
						handleDragEnd,
					}}
				/>


				<ChoiceOptions
					currentScenario={currentScenario}
					leftOpacity={leftOpacity}
					rightOpacity={rightOpacity}
					isAnimating={isAnimating}
				/>



				<div className="mt-8 text-center font-mono">
					<p className="text-2xl">2075</p>
					<p className="text-neutral-400">{dayCount} days in power</p>
				</div>
			</div>
		</div>
	);
}
