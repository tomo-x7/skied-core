import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import type { DialogControlProps } from "#/components/Dialog";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { MAX_ALT_TEXT } from "#/lib/constants";
import { enforceLen } from "#/lib/strings/helpers";
import type { ComposerImage } from "#/state/gallery";
import { AltTextCounterWrapper } from "#/view/com/composer/AltTextCounterWrapper";

type Props = {
	control: Dialog.DialogOuterProps["control"];
	image: ComposerImage;
	onChange: (next: ComposerImage) => void;
};

export const ImageAltTextDialog = ({ control, image, onChange }: Props): React.ReactNode => {
	const [altText, setAltText] = React.useState(image.alt);

	return (
		<Dialog.Outer
			control={control}
			onClose={() => {
				onChange({
					...image,
					alt: enforceLen(altText, MAX_ALT_TEXT, true),
				});
			}}
		>
			<Dialog.Handle />
			<ImageAltTextInner control={control} image={image} altText={altText} setAltText={setAltText} />
		</Dialog.Outer>
	);
};

const ImageAltTextInner = ({
	altText,
	setAltText,
	control,
	image,
}: {
	altText: string;
	setAltText: (text: string) => void;
	control: DialogControlProps;
	image: Props["image"];
}): React.ReactNode => {
	const t = useTheme();

	const imageStyle = React.useMemo<React.CSSProperties>(() => {
		const maxWidth = 450;
		const source = image.transformed ?? image.source;

		if (source.height > source.width) {
			return {
				resizeMode: "contain",
				width: "100%",
				aspectRatio: 1,
				borderRadius: 8,
			};
		}
		return {
			width: "100%",
			height: (maxWidth / source.width) * source.height,
			borderRadius: 8,
		};
	}, [image]);

	return (
		<Dialog.ScrollableInner label={"Add alt text"}>
			<Dialog.Close />
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

				<div
					style={{
						...t.atoms.bg_contrast_50,
						...a.rounded_sm,
						...a.overflow_hidden,
					}}
				>
					<img
						style={{ ...imageStyle, objectFit: "contain", userSelect: "text" }}
						src={(image.transformed ?? image.source).path}
					/>
				</div>
			</div>
			<div
				style={{
					...a.mt_md,
					...a.gap_md,
				}}
			>
				<div style={a.gap_sm}>
					<div
						style={{
							...a.relative,
							...{ width: "100%" },
						}}
					>
						<TextField.LabelText>Descriptive alt text</TextField.LabelText>
						<TextField.Root>
							<Dialog.Input
								label={"Alt text"}
								onChangeText={(text) => {
									setAltText(text);
								}}
								defaultValue={altText}
								multiline
								// TODO
								// numberOfLines={3}
								autoFocus
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
						disabled={altText === image.alt}
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
		</Dialog.ScrollableInner>
	);
};
