import type { AppBskyActorDefs } from "@atproto/api";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { NewskieDialog } from "#/components/NewskieDialog";
import { Text } from "#/components/Typography";
import { isInvalidHandle } from "#/lib/strings/handles";
import type { Shadow } from "#/state/cache/types";

export function ProfileHeaderHandle({
	profile,
	disableTaps,
}: {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	disableTaps?: boolean;
}) {
	const t = useTheme();
	const invalidHandle = isInvalidHandle(profile.handle);
	const blockHide = profile.viewer?.blocking || profile.viewer?.blockedBy;
	return (
		<View
			style={[a.flex_row, a.gap_xs, a.align_center, { maxWidth: "100%" }]}
			pointerEvents={disableTaps ? "none" : "box-none"}
		>
			<NewskieDialog profile={profile} disabled={disableTaps} />
			{profile.viewer?.followedBy && !blockHide ? (
				<View style={[t.atoms.bg_contrast_25, a.rounded_xs, a.px_sm, a.py_xs]}>
					<Text style={[t.atoms.text, a.text_sm]}>Follows you</Text>
				</View>
			) : undefined}
			<Text
				emoji
				numberOfLines={1}
				style={[
					invalidHandle
						? [a.border, a.text_xs, a.px_sm, a.py_xs, a.rounded_xs, { borderColor: t.palette.contrast_200 }]
						: [a.text_md, a.leading_snug, t.atoms.text_contrast_medium], //@ts-expect-error
					{ wordBreak: "break-all" },
				]}
			>
				{invalidHandle ? "⚠Invalid Handle" : `@${profile.handle}`}
			</Text>
		</View>
	);
}
