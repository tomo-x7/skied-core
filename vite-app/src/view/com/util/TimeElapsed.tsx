import React, { type JSX } from "react";

import { useGetTimeAgo } from "#/lib/hooks/useTimeAgo";
import { useTickEveryMinute } from "#/state/shell";

export function TimeElapsed({
	timestamp,
	children,
	timeToString,
}: {
	timestamp: string;
	children: ({ timeElapsed }: { timeElapsed: string }) => JSX.Element;
	timeToString?: (timeElapsed: string) => string;
}) {
	const ago = useGetTimeAgo();
	const tick = useTickEveryMinute();
	const [timeElapsed, setTimeAgo] = React.useState(() =>
		timeToString ? timeToString(timestamp) : ago(timestamp, tick),
	);

	const [prevTick, setPrevTick] = React.useState(tick);
	if (prevTick !== tick) {
		setPrevTick(tick);
		setTimeAgo(timeToString ? timeToString(timestamp) : ago(timestamp, tick));
	}

	return children({ timeElapsed });
}
