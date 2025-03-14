import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps, JSX } from "react";
import { StyleSheet, type TouchableWithoutFeedback } from "react-native";
import Animated from "react-native-reanimated";
import { PressableScale } from "#/lib/custom-animations/PressableScale";
import { useMinimalShellFabTransform } from "#/lib/hooks/useMinimalShellTransform";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { clamp } from "#/lib/numbers";
import { gradients } from "#/lib/styles";

export interface FABProps extends ComponentProps<typeof TouchableWithoutFeedback> {
	testID?: string;
	icon: JSX.Element;
}

export function FABInner({ testID, icon, onPress, ...props }: FABProps) {
	const { isMobile, isTablet } = useWebMediaQueries();
	const fabMinimalShellTransform = useMinimalShellFabTransform();

	const size = isTablet ? styles.sizeLarge : styles.sizeRegular;

	const tabletSpacing = isTablet ? { right: 50, bottom: 50 } : { right: 24, bottom: clamp(0, 15, 60) + 15 };

	return (
		<Animated.View style={[styles.outer, size, tabletSpacing, isMobile && fabMinimalShellTransform]}>
			<PressableScale
				testID={testID}
				onPress={(evt) => {
					onPress?.(evt);
				}}
				targetScale={0.9}
				{...props}
			>
				<LinearGradient
					colors={[gradients.blueLight.start, gradients.blueLight.end]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[styles.inner, size]}
				>
					{icon}
				</LinearGradient>
			</PressableScale>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	sizeRegular: {
		width: 60,
		height: 60,
		borderRadius: 30,
	},
	sizeLarge: {
		width: 70,
		height: 70,
		borderRadius: 35,
	},
	outer: {
		// @ts-ignore web-only
		position: "fixed",
		zIndex: 1,
		cursor: "pointer",
	},
	inner: {
		justifyContent: "center",
		alignItems: "center",
	},
});
