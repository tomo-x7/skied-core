import { type PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";
import { useAnimatedGestureHandler } from "react-native-reanimated";
import { GESTURE_SOURCE } from "../constants";
import type { GestureEventContextType, GestureEventHandlerCallbackType } from "../types";

const resetContext = (context: any) => {
	"worklet";

	Object.keys(context).map((key) => {
		context[key] = undefined;
	});
};

export const useGestureHandler = (
	type: GESTURE_SOURCE,
	state: Animated.SharedValue<State>,
	gestureSource: Animated.SharedValue<GESTURE_SOURCE>,
	handleOnStart: GestureEventHandlerCallbackType,
	handleOnActive: GestureEventHandlerCallbackType,
	handleOnEnd: GestureEventHandlerCallbackType,
): ((event: PanGestureHandlerGestureEvent) => void) => {
	const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureEventContextType>(
		{
			onActive: (payload, context) => {
				if (!context.didStart) {
					context.didStart = true;

					state.value = State.BEGAN;
					gestureSource.value = type;

					handleOnStart(type, payload, context);
					return;
				}

				if (gestureSource.value !== type) {
					return;
				}

				state.value = payload.state;
				handleOnActive(type, payload, context);
			},
			onEnd: (payload, context) => {
				if (gestureSource.value !== type) {
					return;
				}

				state.value = payload.state;
				gestureSource.value = GESTURE_SOURCE.UNDETERMINED;

				handleOnEnd(type, payload, context);
				resetContext(context);
			},
			onCancel: (payload, context) => {
				if (gestureSource.value !== type) {
					return;
				}

				state.value = payload.state;
				gestureSource.value = GESTURE_SOURCE.UNDETERMINED;

				resetContext(context);
			},
			onFail: (payload, context) => {
				if (gestureSource.value !== type) {
					return;
				}

				state.value = payload.state;
				gestureSource.value = GESTURE_SOURCE.UNDETERMINED;

				resetContext(context);
			},
			onFinish: (payload, context) => {
				if (gestureSource.value !== type) {
					return;
				}

				state.value = payload.state;
				gestureSource.value = GESTURE_SOURCE.UNDETERMINED;

				resetContext(context);
			},
		},
		[type, state, handleOnStart, handleOnActive, handleOnEnd],
	);
	return gestureHandler;
};
