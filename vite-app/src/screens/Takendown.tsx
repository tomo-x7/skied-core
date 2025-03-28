import { type ComAtprotoAdminDefs, ComAtprotoModerationDefs } from "@atproto/api";
import { useMutation } from "@tanstack/react-query";
import Graphemer from "graphemer";
import { useMemo, useState } from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { InlineLinkText } from "#/components/Link";
import { Loader } from "#/components/Loader";
import { Modal } from "#/components/Motal";
import { P, Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { MAX_REPORT_REASON_GRAPHEME_LENGTH } from "#/lib/constants";
import { useEnableKeyboardController } from "#/lib/hooks/useEnableKeyboardController";
import { cleanError } from "#/lib/strings/errors";
import { useAgent, useSession, useSessionApi } from "#/state/session";
import { CharProgress } from "#/view/com/composer/char-progress/CharProgress";
import { Logo } from "#/view/icons/Logo";

const COL_WIDTH = 400;

export function Takendown() {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { currentAccount } = useSession();
	const { logoutCurrentAccount } = useSessionApi();
	const agent = useAgent();
	const [isAppealling, setIsAppealling] = useState(false);
	const [reason, setReason] = useState("");
	const graphemer = useMemo(() => new Graphemer(), []);

	const reasonGraphemeLength = useMemo(() => {
		return graphemer.countGraphemes(reason);
	}, [graphemer, reason]);

	const {
		mutate: submitAppeal,
		isPending,
		isSuccess,
		error,
	} = useMutation({
		mutationFn: async (appealText: string) => {
			if (!currentAccount) throw new Error("No session");
			await agent.com.atproto.moderation.createReport({
				reasonType: ComAtprotoModerationDefs.REASONAPPEAL,
				subject: {
					$type: "com.atproto.admin.defs#repoRef",
					did: currentAccount.did,
				} satisfies ComAtprotoAdminDefs.RepoRef,
				reason: appealText,
			});
		},
		onSuccess: () => setReason(""),
	});

	const primaryBtn =
		isAppealling && !isSuccess ? (
			<Button
				variant="solid"
				color="primary"
				size="large"
				label={"Submit appeal"}
				onPress={() => submitAppeal(reason)}
				disabled={isPending || reasonGraphemeLength > MAX_REPORT_REASON_GRAPHEME_LENGTH}
			>
				<ButtonText>Submit Appeal</ButtonText>
				{isPending && <ButtonIcon icon={Loader} />}
			</Button>
		) : (
			<Button
				variant="solid"
				size="large"
				color="secondary_inverted"
				label={"Sign out"}
				onPress={() => logoutCurrentAccount()}
			>
				<ButtonText>Sign Out</ButtonText>
			</Button>
		);

	const secondaryBtn = isAppealling ? (
		!isSuccess && (
			<Button
				variant="ghost"
				size="large"
				color="secondary"
				label={"Cancel"}
				onPress={() => setIsAppealling(false)}
			>
				<ButtonText>Cancel</ButtonText>
			</Button>
		)
	) : (
		<Button
			variant="ghost"
			size="large"
			color="secondary"
			label={"Appeal suspension"}
			onPress={() => setIsAppealling(true)}
		>
			<ButtonText>Appeal Suspension</ButtonText>
		</Button>
	);

	const webLayout = gtMobile;

	useEnableKeyboardController(true);

	return (
		<Modal visible presentationStyle="formSheet" style={a.util_screen_outer}>
			<div
				// KeyboardAwareScrollView
				style={{
					...a.flex_1,
					...t.atoms.bg,
				}}
				// centerContent
			>
				<div
					style={{
						...a.flex_row,
						...a.justify_center,
						...(gtMobile ? a.pt_4xl : flatten([a.px_xl, a.pt_4xl])),
					}}
				>
					<div
						style={{
							...a.flex_1,
							...{ maxWidth: COL_WIDTH, minHeight: COL_WIDTH },
						}}
					>
						<div style={a.pb_xl}>
							<Logo width={64} />
						</div>

						<Text
							style={{
								...a.text_4xl,
								...a.font_heavy,
								...a.pb_md,
							}}
						>
							{isAppealling ? <>Appeal suspension</> : <>Your account has been suspended</>}
						</Text>

						{isAppealling ? (
							<div
								style={{
									...a.relative,
									...a.w_full,
									...a.mt_xl,
								}}
							>
								{isSuccess ? (
									<P
										style={{
											...t.atoms.text_contrast_medium,
											...a.text_center,
										}}
									>
										Your appeal has been submitted. If your appeal succeeds, you will receive an
										email.
									</P>
								) : (
									<>
										<TextField.LabelText>Reason for appeal</TextField.LabelText>
										<TextField.Root
											isInvalid={
												reasonGraphemeLength > MAX_REPORT_REASON_GRAPHEME_LENGTH || !!error
											}
										>
											<TextField.Input
												label={"Reason for appeal"}
												defaultValue={reason}
												onChangeText={setReason}
												placeholder={"Why are you appealing?"}
												multiline
												numberOfLines={5}
												autoFocus
												style={{ paddingBottom: 40, minHeight: 150 }}
												maxLength={MAX_REPORT_REASON_GRAPHEME_LENGTH * 10}
											/>
										</TextField.Root>
										<div
											style={{
												...a.absolute,
												...a.flex_row,
												...a.align_center,
												...a.pr_md,
												...a.pb_sm,

												...{
													bottom: 0,
													right: 0,
												},
											}}
										>
											<CharProgress
												count={reasonGraphemeLength}
												max={MAX_REPORT_REASON_GRAPHEME_LENGTH}
											/>
										</div>
									</>
								)}
								{error && (
									<Text
										style={{
											...a.text_md,
											...a.leading_normal,
											...{ color: t.palette.negative_500 },
											...a.mt_lg,
										}}
									>
										{cleanError(error)}
									</Text>
								)}
							</div>
						) : (
							<P style={t.atoms.text_contrast_medium}>
								<>
									Your account was found to be in violation of the{" "}
									<InlineLinkText
										label={"Bluesky Social Terms of Service"}
										to="https://bsky.social/about/support/tos"
										style={{
											...a.text_md,
											...a.leading_normal,
										}}
										overridePresentation
									>
										Bluesky Social Terms of Service
									</InlineLinkText>
									. You have been sent an email outlining the specific violation and suspension
									period, if applicable. You can appeal this decision if you believe it was made in
									error.
								</>
							</P>
						)}

						{webLayout && (
							<div
								style={{
									...a.w_full,
									...a.flex_row,
									...a.justify_between,
									...a.pt_5xl,
									...{ paddingBottom: 200 },
								}}
							>
								{secondaryBtn}
								{primaryBtn}
							</div>
						)}
					</div>
				</div>
			</div>
			{!webLayout && (
				<div
					style={{
						...a.align_center,
						...t.atoms.bg,
						...(gtMobile ? a.px_5xl : a.px_xl),
						...{ paddingBottom: a.pb_5xl.paddingBottom },
					}}
				>
					<div
						style={{
							...a.w_full,
							...a.gap_sm,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						{primaryBtn}
						{secondaryBtn}
					</div>
				</div>
			)}
		</Modal>
	);
}
