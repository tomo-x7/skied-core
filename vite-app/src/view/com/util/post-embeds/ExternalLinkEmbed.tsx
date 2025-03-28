import type { AppBskyEmbedExternal } from "@atproto/api";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Divider } from "#/components/Divider";
import { Link } from "#/components/Link";
import { Text } from "#/components/Typography";
import { Earth_Stroke2_Corner0_Rounded as Globe } from "#/components/icons/Globe";
import { parseAltFromGIFDescription } from "#/lib/gif-alt-text";
import { parseEmbedPlayerFromUrl } from "#/lib/strings/embed-player";
import { toNiceDomain } from "#/lib/strings/url-helpers";
import { useExternalEmbedsPrefs } from "#/state/preferences";
import { ExternalGifEmbed } from "#/view/com/util/post-embeds/ExternalGifEmbed";
import { ExternalPlayer } from "#/view/com/util/post-embeds/ExternalPlayerEmbed";
import { GifEmbed } from "#/view/com/util/post-embeds/GifEmbed";

export const ExternalLinkEmbed = ({
	link,
	onOpen,
	style,
	hideAlt,
}: {
	link: AppBskyEmbedExternal.ViewExternal;
	onOpen?: () => void;
	style?: React.CSSProperties;
	hideAlt?: boolean;
}) => {
	const t = useTheme();
	const externalEmbedPrefs = useExternalEmbedsPrefs();
	const niceUrl = toNiceDomain(link.uri);
	const imageUri = link.thumb;
	const embedPlayerParams = React.useMemo(() => {
		const params = parseEmbedPlayerFromUrl(link.uri);

		if (params && externalEmbedPrefs?.[params.source] !== "hide") {
			return params;
		}
	}, [link.uri, externalEmbedPrefs]);
	const hasMedia = Boolean(imageUri || embedPlayerParams);

	if (embedPlayerParams?.source === "tenor") {
		const parsedAlt = parseAltFromGIFDescription(link.description);
		return (
			<div style={style}>
				<GifEmbed
					params={embedPlayerParams}
					thumb={link.thumb}
					altText={parsedAlt.alt}
					isPreferredAltText={parsedAlt.isPreferred}
					hideAlt={hideAlt}
				/>
			</div>
		);
	}

	return (
		<Link label={link.title || `Open link to ${niceUrl}`} to={link.uri} shouldProxy={true} onPress={onOpen}>
			{({ hovered }) => (
				<div
					style={{
						...a.transition_color,

						...a.flex_col,
						...a.rounded_md,
						...a.overflow_hidden,
						...a.w_full,
						...a.border,
						...style,
						...(hovered ? t.atoms.border_contrast_high : t.atoms.border_contrast_low),
					}}
				>
					{imageUri && !embedPlayerParams ? (
						<img
							style={{
								aspectRatio: 1.91,
							}}
							src={imageUri}
						/>
					) : undefined}

					{embedPlayerParams?.isGif ? (
						<ExternalGifEmbed link={link} params={embedPlayerParams} />
					) : embedPlayerParams ? (
						<ExternalPlayer link={link} params={embedPlayerParams} />
					) : undefined}

					<div
						style={{
							...a.flex_1,
							...a.pt_sm,
							...{ gap: 3 },
							...(hasMedia && a.border_t),
							...(hovered ? t.atoms.border_contrast_high : t.atoms.border_contrast_low),
						}}
					>
						<div
							style={{
								...{ gap: 3 },
								...a.pb_xs,
								...a.px_md,
							}}
						>
							{!embedPlayerParams?.isGif && !embedPlayerParams?.dimensions && (
								<Text
									numberOfLines={3}
									style={{
										...a.text_md,
										...a.font_bold,
										...a.leading_snug,
									}}
								>
									{link.title || link.uri}
								</Text>
							)}
							{link.description ? (
								<Text
									numberOfLines={link.thumb ? 2 : 4}
									style={{
										...a.text_sm,
										...a.leading_snug,
									}}
								>
									{link.description}
								</Text>
							) : undefined}
						</div>
						<div style={a.px_md}>
							<Divider />
							<div
								style={{
									...a.flex_row,
									...a.align_center,
									...a.gap_2xs,
									...a.pb_sm,

									...{
										paddingTop: 6, // off menu
									},
								}}
							>
								<Globe
									size="xs"
									style={{
										...a.transition_color,

										...(hovered ? t.atoms.text_contrast_medium : t.atoms.text_contrast_low),
									}}
								/>
								<Text
									numberOfLines={1}
									style={{
										...a.transition_color,

										...a.text_xs,
										...a.leading_snug,
										...(hovered ? t.atoms.text_contrast_high : t.atoms.text_contrast_medium),
									}}
								>
									{toNiceDomain(link.uri)}
								</Text>
							</div>
						</div>
					</div>
				</div>
			)}
		</Link>
	);
};
