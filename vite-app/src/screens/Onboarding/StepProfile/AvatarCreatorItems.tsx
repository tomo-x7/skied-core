import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Text } from "#/components/Typography";
import type { Avatar } from "#/screens/Onboarding/StepProfile/index";
import {
	type AvatarColor,
	type EmojiName,
	avatarColors,
	emojiItems,
	emojiNames,
} from "#/screens/Onboarding/StepProfile/types";

const ACTIVE_BORDER_WIDTH = 3;
const ACTIVE_BORDER_STYLES = {
	top: -ACTIVE_BORDER_WIDTH,
	bottom: -ACTIVE_BORDER_WIDTH,
	left: -ACTIVE_BORDER_WIDTH,
	right: -ACTIVE_BORDER_WIDTH,
	opacity: 0.5,
	borderWidth: 3,
};

export function AvatarCreatorItems({
	type,
	avatar,
	setAvatar,
}: {
	type: "emojis" | "colors";
	avatar: Avatar;
	setAvatar: React.Dispatch<React.SetStateAction<Avatar>>;
}) {
	const t = useTheme();
	const isEmojis = type === "emojis";

	const onSelectEmoji = React.useCallback(
		(emoji: EmojiName) => {
			setAvatar((prev) => ({
				...prev,
				placeholder: emojiItems[emoji],
			}));
		},
		[setAvatar],
	);

	const onSelectColor = React.useCallback(
		(color: AvatarColor) => {
			setAvatar((prev) => ({
				...prev,
				backgroundColor: color,
			}));
		},
		[setAvatar],
	);

	return (
		<div style={a.w_full}>
			<Text
				style={{
					...a.pb_md,
					...t.atoms.text_contrast_medium,
				}}
			>
				{isEmojis ? <>Select an emoji</> : <>Select a color</>}
			</Text>
			<div
				style={{
					...a.flex_row,
					...a.align_start,
					...a.justify_start,
					...a.flex_wrap,
					...a.gap_md,
				}}
			>
				{isEmojis
					? emojiNames.map((emojiName) => (
							<Button
								key={emojiName}
								label={`Select the ${emojiName} emoji as your avatar`}
								size="small"
								shape="round"
								variant="solid"
								color="secondary"
								onPress={() => onSelectEmoji(emojiName)}
							>
								<ButtonIcon icon={emojiItems[emojiName].component} />
								{avatar.placeholder.name === emojiName && (
									<div
										style={{
											...a.absolute,
											...a.rounded_full,
											...ACTIVE_BORDER_STYLES,

											...{
												borderColor: avatar.backgroundColor,
											},
										}}
									/>
								)}
							</Button>
						))
					: avatarColors.map((color) => (
							<Button
								key={color}
								label={"Choose this color as your avatar"}
								size="small"
								shape="round"
								variant="solid"
								onPress={() => onSelectColor(color)}
							>
								{(ctx) => (
									<>
										<div
											style={{
												...a.absolute,
												...a.inset_0,
												...a.rounded_full,

												...{
													opacity: ctx.hovered || ctx.pressed ? 0.8 : 1,
													backgroundColor: color,
												},
											}}
										/>

										{avatar.backgroundColor === color && (
											<div
												style={{
													...a.absolute,
													...a.rounded_full,
													...ACTIVE_BORDER_STYLES,

													...{
														borderColor: color,
													},
												}}
											/>
										)}
									</>
								)}
							</Button>
						))}
			</div>
		</div>
	);
}
