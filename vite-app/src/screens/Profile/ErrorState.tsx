import React from "react";

import { useNavigate } from "react-router-dom";
import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";

export function ErrorState({ error }: { error: string }) {
	const t = useTheme();
	const navigate = useNavigate();

	const onPressBack = React.useCallback(() => {
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	}, [navigate]);

	return (
		<div style={a.px_xl}>
			<CircleInfo width={48} style={t.atoms.text_contrast_low} />
			<Text
				style={{
					...a.text_xl,
					...a.font_bold,
					...a.pb_md,
					...a.pt_xl,
				}}
			>
				Hmmmm, we couldn't load that moderation service.
			</Text>
			<Text
				style={{
					...a.text_md,
					...a.leading_normal,
					...a.pb_md,
					...t.atoms.text_contrast_medium,
				}}
			>
				This moderation service is unavailable. See below for more details. If this issue persists, contact us.
			</Text>
			<div
				style={{
					...a.relative,
					...a.py_md,
					...a.px_lg,
					...a.rounded_md,
					...a.mb_2xl,
					...t.atoms.bg_contrast_25,
				}}
			>
				<Text
					style={{
						...a.text_md,
						...a.leading_normal,
					}}
				>
					{error}
				</Text>
			</div>
			<div style={{ flexDirection: "row" }}>
				<Button size="small" color="secondary" variant="solid" label={"Go Back"} onPress={onPressBack}>
					<ButtonText>Go Back</ButtonText>
				</Button>
			</div>
		</div>
	);
}
