import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { TIMELINE_SAVED_FEED } from "#/lib/constants";
import { useAddSavedFeedsMutation } from "#/state/queries/preferences";

export function NoFollowingFeed() {
	const t = useTheme();
	const { mutateAsync: addSavedFeeds } = useAddSavedFeedsMutation();

	const addRecommendedFeeds = React.useCallback(
		(e: any) => {
			e.preventDefault();

			addSavedFeeds([
				{
					...TIMELINE_SAVED_FEED,
					pinned: true,
				},
			]);

			// prevent navigation
			return false;
		},
		[addSavedFeeds],
	);

	return (
		<div
			style={{
				...a.flex_row,
				...a.flex_wrap,
				...a.align_center,
				...a.py_md,
				...a.px_lg,
			}}
		>
			<Text
				style={{
					...a.leading_snug,
					...t.atoms.text_contrast_medium,
				}}
			>
				<>
					Looks like you're missing a following feed.{" "}
					<InlineLinkText
						to="/"
						label={"Add the default feed of only people you follow"}
						onPress={addRecommendedFeeds}
						style={a.leading_snug}
					>
						Click here to add one.
					</InlineLinkText>
				</>
			</Text>
		</div>
	);
}
