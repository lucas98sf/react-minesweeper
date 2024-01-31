import { useState } from "react";

export function useTimer() {
	const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
	const [timeElapsed, setTimeElapsed] = useState<number>(0);

	const startTimer = () => {
		if (!intervalId) {
			const intervalId = setInterval(() => {
				setTimeElapsed((prevTime) => prevTime + 1);
			}, 1000);
			setIntervalId(intervalId);
		}
	};

	const stopTimer = () => {
		if (intervalId) {
			clearInterval(intervalId as NodeJS.Timeout);
			setIntervalId(null);
		}
	};

	const resetTimer = () => {
		if (intervalId) {
			clearInterval(intervalId as NodeJS.Timeout);
			setIntervalId(null);
		}
		setTimeElapsed(0);
	};

	return {
		timeElapsed: new Intl.NumberFormat("en-US", {
			minimumIntegerDigits: 3,
		}).format(timeElapsed),
		startTimer,
		stopTimer,
		resetTimer,
	};
}
