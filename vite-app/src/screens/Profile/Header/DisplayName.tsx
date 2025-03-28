import type { AppBskyActorDefs, ModerationDecision } from "@atproto/api";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import type { Shadow } from "#/state/cache/types";

export function ProfileHeaderDisplayName({
	profile,
	moderation,
}: {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	moderation: ModerationDecision;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();

	return (
		<div style={{ pointerEvents: "none" }}>
			<Text
				style={{
					...t.atoms.text,
					...(gtMobile ? a.text_4xl : a.text_3xl),
					...a.self_start,
					...a.font_heavy,
				}}
			>
				{sanitizeDisplayName(
					profile.displayName || sanitizeHandle(profile.handle),
					moderation.ui("displayName"),
				)}
			</Text>
		</div>
	);
}
