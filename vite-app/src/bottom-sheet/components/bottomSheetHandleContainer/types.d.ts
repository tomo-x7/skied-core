import type { PanGestureHandlerProperties } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";
import type { useInteractivePanGestureHandlerConfigs } from "../../hooks/useGestureHandler";
import type { BottomSheetProps } from "../bottomSheet";
import type { BottomSheetHandleProps } from "../bottomSheetHandle";

export interface BottomSheetHandleContainerProps
	extends Pick<PanGestureHandlerProperties, "simultaneousHandlers">,
		Pick<
			BottomSheetProps,
			"handleComponent" | "enableHandlePanningGesture" | "handleIndicatorStyle" | "handleStyle"
		>,
		Pick<
			useInteractivePanGestureHandlerConfigs,
			"enableOverDrag" | "enablePanDownToClose" | "overDragResistanceFactor" | "keyboardBehavior"
		>,
		BottomSheetHandleProps {
	handleHeight: Animated.SharedValue<number>;
}
