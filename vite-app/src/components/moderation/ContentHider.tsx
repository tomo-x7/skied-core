import type { ModerationUI } from "@atproto/api";
import React from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import { Text } from "#/components/Typography";
import { ModerationDetailsDialog } from "#/components/moderation/ModerationDetailsDialog";
import { ADULT_CONTENT_LABELS, isJustAMute } from "#/lib/moderation";
import { useGlobalLabelStrings } from "#/lib/moderation/useGlobalLabelStrings";
import { getDefinition, getLabelStrings } from "#/lib/moderation/useLabelInfo";
import { useModerationCauseDescription } from "#/lib/moderation/useModerationCauseDescription";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { useLabelDefinitions } from "#/state/preferences";
import { useDialogControl } from "../Dialog";

export function ContentHider({
	modui,
	ignoreMute,
	style,
	childContainerStyle,
	children,
}: React.PropsWithChildren<{
	modui: ModerationUI | undefined;
	ignoreMute?: boolean;
	style?: React.CSSProperties;
	childContainerStyle?: React.CSSProperties;
}>) {
	const blur = modui?.blurs[0];
	if (!blur || (ignoreMute && isJustAMute(modui))) {
		return <div style={style}>{children}</div>;
	}
	return (
		<ContentHiderActive modui={modui} style={style} childContainerStyle={childContainerStyle}>
			{children}
		</ContentHiderActive>
	);
}

function ContentHiderActive({
	modui,
	style,
	childContainerStyle,
	children,
}: React.PropsWithChildren<{
	modui: ModerationUI;
	style?: React.CSSProperties;
	childContainerStyle?: React.CSSProperties;
}>) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const [override, setOverride] = React.useState(false);
	const control = useDialogControl();
	const { labelDefs } = useLabelDefinitions();
	const globalLabelStrings = useGlobalLabelStrings();
	const blur = modui?.blurs[0];
	const desc = useModerationCauseDescription(blur);

	const labelName = React.useMemo(() => {
		if (!modui?.blurs || !blur) {
			return undefined;
		}
		if (blur.type !== "label" || (blur.type === "label" && blur.source.type !== "user")) {
			return desc.name;
		}

		let hasAdultContentLabel = false;
		const selfBlurNames = modui.blurs
			.filter((cause) => {
				if (cause.type !== "label") {
					return false;
				}
				if (cause.source.type !== "user") {
					return false;
				}
				if (ADULT_CONTENT_LABELS.includes(cause.label.val)) {
					if (hasAdultContentLabel) {
						return false;
					}
					hasAdultContentLabel = true;
				}
				return true;
			})
			.slice(0, 2)
			.map((cause) => {
				if (cause.type !== "label") {
					return;
				}

				const def = cause.labelDef || getDefinition(labelDefs, cause.label);
				if (def.identifier === "porn" || def.identifier === "sexual") {
					return "Adult Content";
				}
				return getLabelStrings(globalLabelStrings, def).name;
			});

		if (selfBlurNames.length === 0) {
			return desc.name;
		}
		return [...new Set(selfBlurNames)].join(", ");
	}, [modui?.blurs, blur, desc.name, labelDefs, globalLabelStrings]);

	return (
		<div
			style={{
				...a.overflow_hidden,
				...style,
			}}
		>
			<ModerationDetailsDialog control={control} modcause={blur} />
			<Button
				onPress={(e) => {
					e.preventDefault();
					e.stopPropagation();
					if (!modui.noOverride) {
						setOverride((v) => !v);
					} else {
						control.open();
					}
				}}
				label={desc.name}
			>
				{(state) => (
					<div
						style={{
							...a.flex_row,
							...a.w_full,
							...a.justify_start,
							...a.align_center,
							...a.py_md,
							...a.px_lg,
							...a.gap_xs,
							...a.rounded_sm,
							...t.atoms.bg_contrast_25,
							...flatten(gtMobile ? [a.gap_sm, a.py_lg, a.mt_xs, a.px_xl] : []),
							...((state.hovered || state.pressed) && t.atoms.bg_contrast_50),
						}}
					>
						<desc.icon size="md" fill={t.atoms.text_contrast_medium.color} style={{ marginLeft: -2 }} />
						<Text
							style={{
								...a.flex_1,
								...a.text_left,
								...a.font_bold,
								...a.leading_snug,
								...(gtMobile && a.font_bold),
								...t.atoms.text_contrast_medium,

								...{
									marginBottom: 1,
								},
							}}
							numberOfLines={2}
						>
							{labelName}
						</Text>
						{!modui.noOverride && (
							<Text
								style={{
									...a.font_bold,
									...a.leading_snug,
									...(gtMobile && a.font_bold),
									...t.atoms.text_contrast_high,

									marginBottom: 1,
								}}
							>
								{override ? <>Hide</> : <>Show</>}
							</Text>
						)}
					</div>
				)}
			</Button>
			{desc.source && blur.type === "label" && !override && (
				<Button
					onPress={(e) => {
						e.preventDefault();
						e.stopPropagation();
						control.open();
					}}
					label={"Learn more about the moderation applied to this content."}
					style={a.pt_sm}
				>
					{(state) => (
						<Text
							style={{
								...a.flex_1,
								...a.text_sm,
								...a.font_normal,
								...a.leading_snug,
								...t.atoms.text_contrast_medium,
								...a.text_left,
							}}
						>
							{desc.sourceType === "user" ? (
								<>Labeled by the author.</>
							) : (
								<>Labeled by {sanitizeDisplayName(desc.source!)}.</>
							)}{" "}
							<Text
								style={{
									...{ color: t.palette.primary_500 },
									...a.text_sm,

									...(state.hovered && { textDecoration: "underline" }),
								}}
							>
								Learn more.
							</Text>
						</Text>
					)}
				</Button>
			)}
			{override && <div style={childContainerStyle}>{children}</div>}
		</div>
	);
}
