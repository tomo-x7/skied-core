import type { AppBskyEmbedImages } from "@atproto/api";
import type React from "react";

import type { RefObject } from "react";
import { atoms as a, useTheme } from "#/alf";
import { MediaInsetBorder } from "#/components/MediaInsetBorder";
import { Text } from "#/components/Typography";
import type { Dimensions } from "#/lib/media/types";
import { useLargeAltBadgeEnabled } from "#/state/preferences/large-alt-badge";
import { PostEmbedViewContext } from "#/view/com/util/post-embeds/types";

type EventFunction = (index: number) => void;

interface Props {
	images: AppBskyEmbedImages.ViewImage[];
	index: number;
	onPress?: (index: number, containerRefs: RefObject<HTMLDivElement>[], fetchedDims: (Dimensions | null)[]) => void;
	onLongPress?: EventFunction;
	onPressIn?: EventFunction;
	imageStyle?: React.CSSProperties;
	viewContext?: PostEmbedViewContext;
	insetBorderStyle?: React.CSSProperties;
	containerRefs: RefObject<HTMLDivElement>[];
	thumbDimsRef: React.MutableRefObject<(Dimensions | null)[]>;
}

export function GalleryItem({
	images,
	index,
	imageStyle,
	onPress,
	onPressIn,
	onLongPress,
	viewContext,
	insetBorderStyle,
	containerRefs,
	thumbDimsRef,
}: Props) {
	const t = useTheme();
	const largeAltBadge = useLargeAltBadgeEnabled();
	const image = images[index];
	const hasAlt = !!image.alt;
	const hideBadges = viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia;
	return (
		<div style={a.flex_1} ref={containerRefs[index]}>
			<button
				type="button"
				onClick={onPress ? () => onPress(index, containerRefs, thumbDimsRef.current.slice()) : undefined}
				onMouseDown={onPressIn ? () => onPressIn(index) : undefined}
				// onLongPress={onLongPress ? () => onLongPress(index) : undefined}
				style={{
					...a.flex_1,
					...a.overflow_hidden,
					...t.atoms.bg_contrast_25,
					...imageStyle,
				}}
			>
				<img
					src={image.thumb}
					style={{
						...a.flex_1,
						objectPosition: "left 50% top 50%",
						width: "100%",
						height: "100%",
						position: "absolute",
						left: "0px",
						top: "0px",
						objectFit: "cover",
						transitionDuration: "0ms",
						transitionTimingFunction: "linear",
					}}
					onLoad={(e) => {
						thumbDimsRef.current[index] = {
							width: e.currentTarget.width,
							height: e.currentTarget.height,
						};
					}}
				/>
				<MediaInsetBorder style={insetBorderStyle} />
			</button>
			{hasAlt && !hideBadges ? (
				<div
					style={{
						...a.absolute,
						...a.flex_row,
						...a.align_center,
						...a.rounded_xs,
						...t.atoms.bg_contrast_25,

						...{
							gap: 3,
							padding: 3,
							bottom: a.p_xs.padding,
							right: a.p_xs.padding,
							opacity: 0.8,
						},

						...(largeAltBadge && { gap: 4, padding: 5 }),
					}}
				>
					<Text
						style={{
							...a.font_heavy,
							...(largeAltBadge ? a.text_xs : { fontSize: 8 }),
						}}
					>
						ALT
					</Text>
				</div>
			) : null}
		</div>
	);
}
