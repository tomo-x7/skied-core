import type { ModerationUI } from "@atproto/api";
import React from "react";

import { useNavigate } from "react-router-dom";
import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { ModerationDetailsDialog } from "#/components/moderation/ModerationDetailsDialog";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { useModerationCauseDescription } from "#/lib/moderation/useModerationCauseDescription";
import { CenteredView } from "#/view/com/util/Views";
import { useDialogControl } from "../Dialog";

export function ScreenHider({
	screenDescription,
	modui,
	style,
	containerStyle,
	children,
}: React.PropsWithChildren<{
	screenDescription: string;
	modui: ModerationUI;
	style?: React.CSSProperties;
	containerStyle?: React.CSSProperties;
}>) {
	const t = useTheme();
	const [override, setOverride] = React.useState(false);
	const navigate = useNavigate();
	const { isMobile } = useWebMediaQueries();
	const control = useDialogControl();
	const blur = modui.blurs[0];
	const desc = useModerationCauseDescription(blur);

	if (!blur || override) {
		return <div style={style}>{children}</div>;
	}

	const isNoPwi = !!modui.blurs.find(
		(cause) => cause.type === "label" && cause.labelDef.identifier === "!no-unauthenticated",
	);
	return (
		<CenteredView
			style={{
				...a.flex_1,

				...{
					paddingTop: 100,
					paddingBottom: 150,
				},

				...t.atoms.bg,
				...containerStyle,
			}}
			sideBorders
		>
			<div
				style={{
					...a.align_center,
					...a.mb_md,
				}}
			>
				<div
					style={{
						...t.atoms.bg_contrast_975,
						...a.align_center,
						...a.justify_center,

						...{
							borderRadius: 25,
							width: 50,
							height: 50,
						},
					}}
				>
					<desc.icon width={24} fill={t.atoms.bg.backgroundColor} />
				</div>
			</div>
			<Text
				style={{
					...a.text_4xl,
					...a.font_bold,
					...a.text_center,
					...a.mb_md,
					...t.atoms.text,
				}}
			>
				{isNoPwi ? <>Sign-in Required</> : <>Content Warning</>}
			</Text>
			<Text
				style={{
					...a.text_lg,
					...a.mb_md,
					...a.px_lg,
					...a.text_center,
					...a.leading_snug,
					...t.atoms.text_contrast_medium,
				}}
			>
				{isNoPwi ? (
					<>This account has requested that users sign in to view their profile.</>
				) : (
					<>
						<>This {screenDescription} has been flagged:</>{" "}
						<Text
							style={{
								...a.text_lg,
								...a.font_bold,
								...a.leading_snug,
								...t.atoms.text,
								...a.ml_xs,
							}}
						>
							{desc.name}.{" "}
						</Text>
						<button
							type="button"
							onClick={() => {
								control.open();
							}}
						>
							<Text
								style={{
									...a.text_lg,
									...a.leading_snug,
									...{ color: t.palette.primary_500 },
									...{ cursor: "pointer" },
								}}
							>
								Learn More
							</Text>
						</button>
						<ModerationDetailsDialog control={control} modcause={blur} />
					</>
				)}{" "}
			</Text>
			{isMobile && <div style={a.flex_1} />}
			<div
				style={{
					...a.flex_row,
					...a.justify_center,
					...a.my_md,
					...a.gap_md,
				}}
			>
				<Button
					variant="solid"
					color="primary"
					size="large"
					style={a.rounded_full}
					label={"Go back"}
					onPress={() => {
						if (history.length > 1) {
							navigate(-1);
						} else {
							navigate("/");
						}
					}}
				>
					<ButtonText>Go back</ButtonText>
				</Button>
				{!modui.noOverride && (
					<Button
						variant="solid"
						color="secondary"
						size="large"
						style={a.rounded_full}
						label={"Show anyway"}
						onPress={() => setOverride((v) => !v)}
					>
						<ButtonText>Show anyway</ButtonText>
					</Button>
				)}
			</div>
		</CenteredView>
	);
}
