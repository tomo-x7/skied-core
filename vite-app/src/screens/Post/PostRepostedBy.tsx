import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { usePostThreadQuery } from "#/state/queries/post-thread";
import { useSetMinimalShellMode } from "#/state/shell";
import { PostRepostedBy as PostRepostedByComponent } from "#/view/com/post-thread/PostRepostedBy";

type Props = NativeStackScreenProps<CommonNavigatorParams, "PostRepostedBy">;
export const PostRepostedByScreen = ({ route }: Props) => {
	const { name, rkey } = route.params;
	const uri = makeRecordUri(name, "app.bsky.feed.post", rkey);
	const setMinimalShellMode = useSetMinimalShellMode();
	const { data: post } = usePostThreadQuery(uri);

	let quoteCount: number | undefined;
	if (post?.thread.type === "post") {
		quoteCount = post.thread.post.repostCount;
	}

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					{post && (
						<>
							<Layout.Header.TitleText>Reposted By</Layout.Header.TitleText>
							<Layout.Header.SubtitleText>
								{quoteCount ?? 0} {quoteCount === 1 ? "repost" : "reposts"}
							</Layout.Header.SubtitleText>
						</>
					)}
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<PostRepostedByComponent uri={uri} />
		</Layout.Screen>
	);
};
