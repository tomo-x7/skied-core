import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";

import { TabState, getTabState } from "#/lib/routes/helpers";

export function useTabFocusEffect(tabName: string, cb: (isInside: boolean) => void) {
	const [isInside, setIsInside] = useState(false);

	// get root navigator state
	let nav = useNavigation();
	while (nav.getParent()) {
		nav = nav.getParent();
	}
	const state = nav.getState();

	useEffect(() => {
		// check if inside
		const v = getTabState(state, tabName) !== TabState.Outside;
		if (v !== isInside) {
			// fire
			setIsInside(v);
			cb(v);
		}
	}, [state, isInside, tabName, cb]);
}
