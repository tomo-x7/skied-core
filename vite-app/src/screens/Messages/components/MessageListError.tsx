import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { type ConvoItem, ConvoItemError } from "#/state/messages/convo/types";

export function MessageListError({ item }: { item: ConvoItem & { type: "error" } }) {
	const t = useTheme();
	const { description, help, cta } = React.useMemo(() => {
		return {
			[ConvoItemError.FirehoseFailed]: {
				description: "This chat was disconnected",
				help: "Press to attempt reconnection",
				cta: "Reconnect",
			},
			[ConvoItemError.HistoryFailed]: {
				description: "Failed to load past messages",
				help: "Press to retry",
				cta: "Retry",
			},
		}[item.code];
	}, [item.code]);

	return (
		<div
			style={{
				...a.py_md,
				...a.w_full,
				...a.flex_row,
				...a.justify_center,
			}}
		>
			<div
				style={{
					...a.flex_1,
					...a.flex_row,
					...a.align_center,
					...a.justify_center,
					...a.gap_sm,
					...{ maxWidth: 400 },
				}}
			>
				<CircleInfo size="sm" fill={t.palette.negative_400} />

				<Text
					style={{
						...a.leading_snug,
						...t.atoms.text_contrast_medium,
					}}
				>
					{description} &middot;{" "}
					{item.retry && (
						<InlineLinkText
							to="#"
							label={help}
							onPress={(e) => {
								e.preventDefault();
								item.retry?.();
								return false;
							}}
						>
							{cta}
						</InlineLinkText>
					)}
				</Text>
			</div>
		</div>
	);
}
