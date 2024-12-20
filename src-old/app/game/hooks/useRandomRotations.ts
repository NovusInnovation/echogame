import { useEffect, useRef } from "react";

export function useRandomRotations(count: number, range: number = 5) {
    const rotations = useRef<number[]>(
        // Initialize with the initial count of random rotations
        Array.from({ length: count }, () => (Math.random() - 0.5) * range),
    );

    useEffect(() => {
        // Only generate new rotations if we need more
        while (rotations.current.length < count) {
            rotations.current.push((Math.random() - 0.5) * range);
        }
    }, [count, range]);

    return rotations.current;
}
