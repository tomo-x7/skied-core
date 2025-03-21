import React from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import type { DialogOuterProps } from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import { Loader } from "#/components/Loader";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { useAgent, useSessionApi } from "#/state/session";

export function DeactivateAccountDialog({
	control,
}: {
	control: DialogOuterProps["control"];
}) {
	return (
		<Prompt.Outer control={control}>
			<DeactivateAccountDialogInner control={control} />
		</Prompt.Outer>
	);
}

function DeactivateAccountDialogInner({
	control,
}: {
	control: DialogOuterProps["control"];
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const agent = useAgent();
	const { logoutCurrentAccount } = useSessionApi();
	const [pending, setPending] = React.useState(false);
	const [error, setError] = React.useState<string | undefined>();

	const handleDeactivate = React.useCallback(async () => {
		try {
			setPending(true);
			await agent.com.atproto.server.deactivateAccount({});
			control.close(() => {
				logoutCurrentAccount();
			});
		} catch (e: any) {
			switch (e.message) {
				case "Bad token scope":
					setError(
						`You're signed in with an App Password. Please sign in with your main password to continue deactivating your account.`,
					);
					break;
				default:
					setError("Something went wrong, please try again");
					break;
			}

			console.error(e, {
				message: "Failed to deactivate account",
			});
		} finally {
			setPending(false);
		}
	}, [agent, control, logoutCurrentAccount]);

	return (
		<>
			<Prompt.TitleText>{"Deactivate account"}</Prompt.TitleText>
			<Prompt.DescriptionText>
				Your profile, posts, feeds, and lists will no longer be visible to other Bluesky users. You can
				reactivate your account at any time by logging in.
			</Prompt.DescriptionText>
			<div style={a.pb_xl}>
				<Divider />
				<div
					style={{
						...a.gap_sm,
						...a.pt_lg,
						...a.pb_xl,
					}}
				>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							...a.leading_snug,
						}}
					>
						There is no time limit for account deactivation, come back any time.
					</Text>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							...a.leading_snug,
						}}
					>
						If you're trying to change your handle or email, do so before you deactivate.
					</Text>
				</div>

				<Divider />
			</div>
			<Prompt.Actions>
				<Button
					variant="solid"
					color="negative"
					size={gtMobile ? "small" : "large"}
					label={"Yes, deactivate"}
					onPress={handleDeactivate}
				>
					<ButtonText>{"Yes, deactivate"}</ButtonText>
					{pending && <ButtonIcon icon={Loader} position="right" />}
				</Button>
				<Prompt.Cancel />
			</Prompt.Actions>
			{error && (
				<div
					style={{
						...a.flex_row,
						...a.gap_sm,
						...a.mt_md,
						...a.p_md,
						...a.rounded_sm,
						...t.atoms.bg_contrast_25,
					}}
				>
					<CircleInfo size="md" fill={t.palette.negative_400} />
					<Text
						style={{
							...a.flex_1,
							...a.leading_snug,
						}}
					>
						{error}
					</Text>
				</div>
			)}
		</>
	);
}
