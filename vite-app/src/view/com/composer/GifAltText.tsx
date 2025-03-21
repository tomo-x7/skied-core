import { useState } from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import type { DialogControlProps } from "#/components/Dialog";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { PlusSmall_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { MAX_ALT_TEXT } from "#/lib/constants";
import { parseAltFromGIFDescription } from "#/lib/gif-alt-text";
import { type EmbedPlayerParams, parseEmbedPlayerFromUrl } from "#/lib/strings/embed-player";
import { useResolveGifQuery } from "#/state/queries/resolve-link";
import type { Gif } from "#/state/queries/tenor";
import { AltTextCounterWrapper } from "#/view/com/composer/AltTextCounterWrapper";
import { GifEmbed } from "../util/post-embeds/GifEmbed";
import { AltTextReminder } from "./photos/Gallery";

export function GifAltTextDialog({
	gif,
	altText,
	onSubmit,
}: {
	gif: Gif;
	altText: string;
	onSubmit: (alt: string) => void;
}) {
	const { data } = useResolveGifQuery(gif);
	const vendorAltText = parseAltFromGIFDescription(data?.description ?? "").alt;
	const params = data ? parseEmbedPlayerFromUrl(data.uri) : undefined;
	if (!data || !params) {
		return null;
	}
	return (
		<GifAltTextDialogLoaded
			altText={altText}
			vendorAltText={vendorAltText}
			thumb={data.thumb?.source.path}
			params={params}
			onSubmit={onSubmit}
		/>
	);
}

export function GifAltTextDialogLoaded({
	vendorAltText,
	altText,
	onSubmit,
	params,
	thumb,
}: {
	vendorAltText: string;
	altText: string;
	onSubmit: (alt: string) => void;
	params: EmbedPlayerParams;
	thumb: string | undefined;
}) {
	const control = Dialog.useDialogControl();
	const t = useTheme();
	const [altTextDraft, setAltTextDraft] = useState(altText || vendorAltText);
	return (
		<>
			<button
				type="button"
				// TODO
				// hitSlop={HITSLOP_10}
				onClick={control.open}
				style={{
					...a.absolute,
					...{ top: 8, left: 8 },
					...{ borderRadius: 6 },
					...a.pl_xs,
					...a.pr_sm,
					...a.py_2xs,
					...a.flex_row,
					...a.gap_xs,
					...a.align_center,
					...{ backgroundColor: "rgba(0, 0, 0, 0.75)" },
				}}
			>
				{altText ? (
					<Check size="xs" fill={t.palette.white} style={a.ml_xs} />
				) : (
					<Plus size="sm" fill={t.palette.white} />
				)}
				<Text
					style={{
						...a.font_bold,
						...{ color: t.palette.white },
					}}
				>
					ALT
				</Text>
			</button>
			<AltTextReminder />
			<Dialog.Outer
				control={control}
				onClose={() => {
					onSubmit(altTextDraft);
				}}
			>
				<Dialog.Handle />
				<AltTextInner
					vendorAltText={vendorAltText}
					altText={altTextDraft}
					onChange={setAltTextDraft}
					thumb={thumb}
					control={control}
					params={params}
				/>
			</Dialog.Outer>
		</>
	);
}

function AltTextInner({
	vendorAltText,
	altText,
	onChange,
	control,
	params,
	thumb,
}: {
	vendorAltText: string;
	altText: string;
	onChange: (text: string) => void;
	control: DialogControlProps;
	params: EmbedPlayerParams;
	thumb: string | undefined;
}) {
	const t = useTheme();

	return (
		<Dialog.ScrollableInner label={"Add alt text"}>
			<div style={a.flex_col_reverse}>
				<div
					style={{
						...a.mt_md,
						...a.gap_md,
					}}
				>
					<div style={a.gap_sm}>
						<div style={a.relative}>
							<TextField.LabelText>Descriptive alt text</TextField.LabelText>
							<TextField.Root>
								<Dialog.Input
									label={"Alt text"}
									placeholder={vendorAltText}
									onChangeText={onChange}
									defaultValue={altText}
									multiline
									// TODO
									// numberOfLines={3}
									autoFocus
									onKeyDown={({ nativeEvent }) => {
										if (nativeEvent.key === "Escape") {
											control.close();
										}
									}}
								/>
							</TextField.Root>
						</div>

						{altText.length > MAX_ALT_TEXT && (
							<div
								style={{
									...a.pb_sm,
									...a.flex_row,
									...a.gap_xs,
								}}
							>
								<CircleInfo fill={t.palette.negative_500} />
								<Text
									style={{
										...a.italic,
										...a.leading_snug,
										...t.atoms.text_contrast_medium,
									}}
								>
									<>Alt text will be truncated. Limit: {MAX_ALT_TEXT.toLocaleString()} characters.</>
								</Text>
							</div>
						)}
					</div>

					<AltTextCounterWrapper altText={altText}>
						<Button
							label={"Save"}
							size="large"
							color="primary"
							variant="solid"
							onPress={() => {
								control.close();
							}}
							style={a.flex_grow}
						>
							<ButtonText>Save</ButtonText>
						</Button>
					</AltTextCounterWrapper>
				</div>
				{/* below the text input to force tab order */}
				<div>
					<Text
						style={{
							...a.text_2xl,
							...a.font_bold,
							...a.leading_tight,
							...a.pb_sm,
						}}
					>
						Add alt text
					</Text>
					<div style={a.align_center}>
						<GifEmbed
							thumb={thumb}
							altText={altText}
							isPreferredAltText={true}
							params={params}
							hideAlt
							style={{ height: 225 }}
						/>
					</div>
				</div>
			</div>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}
