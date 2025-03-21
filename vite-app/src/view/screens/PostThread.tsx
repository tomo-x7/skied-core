import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { useSetMinimalShellMode } from "#/state/shell";
import { PostThread as PostThreadComponent } from "#/view/com/post-thread/PostThread";

type Props = NativeStackScreenProps<CommonNavigatorParams, "PostThread">;
export function PostThreadScreen({ route }: Props) {
	const setMinimalShellMode = useSetMinimalShellMode();

	const { name, rkey } = route.params;
	const uri = makeRecordUri(name, "app.bsky.feed.post", rkey);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<PostThreadComponent uri={uri} />
		</Layout.Screen>
	);
}
