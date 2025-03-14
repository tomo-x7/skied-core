import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { gradients } from "#/alf/tokens";

export function LinearGradientBackground({
	style,
	gradient = "sky",
	children,
	start,
	end,
}: {
	style?: StyleProp<ViewStyle>;
	gradient?: keyof typeof gradients;
	children?: React.ReactNode;
	start?: [number, number];
	end?: [number, number];
}) {
	//@ts-ignore
	const colors = gradients[gradient].values.map(([color]) => {
		return color;
	}) as [string, string, ...string[]];

	if (gradient.length < 2) {
		throw new Error("Gradient must have at least 2 colors");
	}

	return (
		<LinearGradient colors={colors} style={style} start={start} end={end}>
			{children}
		</LinearGradient>
	);
}
