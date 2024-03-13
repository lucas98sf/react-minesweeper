import { useCallback, useRef, useState } from "react";

export function useTimer() {
	const intervalId = useRef<NodeJS.Timeout | null>(null);
	const [timeElapsed, setTimeElapsed] = useState<number>(0);

	const startTimer = useCallback(() => {
		if (!intervalId.current) {
			intervalId.current = setInterval(() => {
				setTimeElapsed((prevTime) => prevTime + 1);
			}, 1000);
		}
	}, []);

	const stopTimer = useCallback(() => {
		if (intervalId.current) {
			clearInterval(intervalId.current as NodeJS.Timeout);
			intervalId.current = null;
		}
	}, []);

	const resetTimer = useCallback(() => {
		if (intervalId.current) {
			clearInterval(intervalId.current as NodeJS.Timeout);
			intervalId.current = null;
		}
		setTimeElapsed(0);
	}, []);

	return {
		timeElapsed: new Intl.NumberFormat("en-US", {
			minimumIntegerDigits: 3,
		}).format(timeElapsed),
		startTimer,
		stopTimer,
		resetTimer,
	};
}
