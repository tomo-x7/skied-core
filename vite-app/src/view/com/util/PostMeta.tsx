import type { AppBskyActorDefs, ModerationDecision } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { memo, useCallback } from "react";

import { atoms as a, useTheme } from "#/alf";
import { WebOnlyInlineLinkText } from "#/components/Link";
import { ProfileHoverCard } from "#/components/ProfileHoverCard";
import { Text } from "#/components/Typography";
import { makeProfileLink } from "#/lib/routes/links";
import { forceLTR } from "#/lib/strings/bidi";
import { NON_BREAKING_SPACE } from "#/lib/strings/constants";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { niceDate } from "#/lib/strings/time";
import { precacheProfile } from "#/state/queries/profile";
import { TimeElapsed } from "./TimeElapsed";
import { PreviewableUserAvatar } from "./UserAvatar";

interface PostMetaOpts {
	author: AppBskyActorDefs.ProfileViewBasic;
	moderation: ModerationDecision | undefined;
	postHref: string;
	timestamp: string;
	showAvatar?: boolean;
	avatarSize?: number;
	onOpenAuthor?: () => void;
	style?: React.CSSProperties;
}

let PostMeta = (opts: PostMetaOpts): React.ReactNode => {
	const t = useTheme();

	const displayName = opts.author.displayName || opts.author.handle;
	const handle = opts.author.handle;
	const profileLink = makeProfileLink(opts.author);
	const queryClient = useQueryClient();
	const onOpenAuthor = opts.onOpenAuthor;
	const onBeforePressAuthor = useCallback(() => {
		precacheProfile(queryClient, opts.author);
		onOpenAuthor?.();
	}, [queryClient, opts.author, onOpenAuthor]);
	const onBeforePressPost = useCallback(() => {
		precacheProfile(queryClient, opts.author);
	}, [queryClient, opts.author]);

	const timestampLabel = niceDate(opts.timestamp);

	return (
		<div
			style={{
				...a.flex_1,
				...a.flex_row,
				...a.align_center,
				...a.pb_2xs,
				...a.gap_xs,
				...a.z_10,
				...opts.style,
			}}
		>
			{opts.showAvatar && (
				<div
					style={{
						...a.self_center,
						...a.mr_2xs,
					}}
				>
					<PreviewableUserAvatar
						size={opts.avatarSize || 16}
						profile={opts.author}
						moderation={opts.moderation?.ui("avatar")}
						type={opts.author.associated?.labeler ? "labeler" : "user"}
					/>
				</div>
			)}
			<ProfileHoverCard inline did={opts.author.did}>
				<Text numberOfLines={1} style={a.flex_shrink}>
					<WebOnlyInlineLinkText
						to={profileLink}
						label={"View profile"}
						disableMismatchWarning
						onPress={onBeforePressAuthor}
						style={t.atoms.text}
					>
						<Text
							style={{
								...a.text_md,
								...a.font_bold,
								...a.leading_snug,
							}}
						>
							{forceLTR(sanitizeDisplayName(displayName, opts.moderation?.ui("displayName")))}
						</Text>
					</WebOnlyInlineLinkText>
					<WebOnlyInlineLinkText
						to={profileLink}
						label={"View profile"}
						disableMismatchWarning
						disableUnderline
						onPress={onBeforePressAuthor}
						style={{
							...a.text_md,
							...t.atoms.text_contrast_medium,
							...a.leading_snug,
						}}
					>
						<Text
							style={{
								...a.text_md,
								...t.atoms.text_contrast_medium,
								...a.leading_snug,
							}}
						>
							{NON_BREAKING_SPACE + sanitizeHandle(handle, "@")}
						</Text>
					</WebOnlyInlineLinkText>
				</Text>
			</ProfileHoverCard>
			{
				<Text
					style={{
						...a.text_md,
						...t.atoms.text_contrast_medium,
					}}
				>
					&middot;
				</Text>
			}
			<TimeElapsed timestamp={opts.timestamp}>
				{({ timeElapsed }) => (
					<WebOnlyInlineLinkText
						to={opts.postHref}
						label={timestampLabel}
						title={timestampLabel}
						disableMismatchWarning
						disableUnderline
						onPress={onBeforePressPost}
						style={{
							...a.text_md,
							...t.atoms.text_contrast_medium,
							...a.leading_snug,

							whiteSpace: "nowrap",
						}}
					>
						{timeElapsed}
					</WebOnlyInlineLinkText>
				)}
			</TimeElapsed>
		</div>
	);
};
PostMeta = memo(PostMeta);
export { PostMeta };
