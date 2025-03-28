import { atoms as a, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import { Text } from "#/components/Typography";
import { EyeSlash_Stroke2_Corner0_Rounded as EyeSlash } from "#/components/icons/EyeSlash";

export function PostThreadShowHiddenReplies({
	type,
	onPress,
	hideTopBorder,
}: {
	type: "hidden" | "muted";
	onPress: () => void;
	hideTopBorder?: boolean;
}) {
	const t = useTheme();
	const label = type === "muted" ? "Show muted replies" : "Show hidden replies";

	return (
		<Button onPress={onPress} label={label}>
			{({ hovered, pressed }) => (
				<div
					style={{
						...a.flex_1,
						...a.flex_row,
						...a.align_center,
						...a.gap_sm,
						...a.py_lg,
						...a.px_xl,
						...(!hideTopBorder && a.border_t),
						...t.atoms.border_contrast_low,
						...(hovered || pressed ? t.atoms.bg_contrast_25 : t.atoms.bg),
					}}
				>
					<div
						style={{
							...t.atoms.bg_contrast_25,
							...a.align_center,
							...a.justify_center,

							...{
								width: 26,
								height: 26,
								borderRadius: 13,
								marginRight: 4,
							},
						}}
					>
						<EyeSlash size="sm" fill={t.atoms.text_contrast_medium.color} />
					</div>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							...a.flex_1,
						}}
						numberOfLines={1}
					>
						{label}
					</Text>
				</div>
			)}
		</Button>
	);
}
