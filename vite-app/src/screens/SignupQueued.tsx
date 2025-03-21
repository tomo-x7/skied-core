import React from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Loader } from "#/components/Loader";
import { Modal } from "#/components/Motal";
import { P, Text } from "#/components/Typography";
import { isSignupQueued, useAgent, useSessionApi } from "#/state/session";
import { useOnboardingDispatch } from "#/state/shell";
import { Logo } from "#/view/icons/Logo";

const COL_WIDTH = 400;

export function SignupQueued() {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const onboardingDispatch = useOnboardingDispatch();
	const { logoutCurrentAccount } = useSessionApi();
	const agent = useAgent();

	const [isProcessing, setProcessing] = React.useState(false);
	const [estimatedTime, setEstimatedTime] = React.useState<string | undefined>(undefined);
	const [placeInQueue, setPlaceInQueue] = React.useState<number | undefined>(undefined);

	const checkStatus = React.useCallback(async () => {
		setProcessing(true);
		try {
			const res = await agent.com.atproto.temp.checkSignupQueue();
			if (res.data.activated) {
				// ready to go, exchange the access token for a usable one and kick off onboarding
				await agent.sessionManager.refreshSession();
				if (!isSignupQueued(agent.session?.accessJwt)) {
					onboardingDispatch({ type: "start" });
				}
			} else {
				// not ready, update UI
				setEstimatedTime(msToString(res.data.estimatedTimeMs));
				if (typeof res.data.placeInQueue !== "undefined") {
					setPlaceInQueue(Math.max(res.data.placeInQueue, 1));
				}
			}
		} catch (e: any) {
			console.error("Failed to check signup queue", { err: e.toString() });
		} finally {
			setProcessing(false);
		}
	}, [onboardingDispatch, agent]);

	React.useEffect(() => {
		checkStatus();
		const interval = setInterval(checkStatus, 60e3);
		return () => clearInterval(interval);
	}, [checkStatus]);

	const checkBtn = (
		<Button
			variant="solid"
			color="primary"
			size="large"
			label={"Check my status"}
			onPress={checkStatus}
			disabled={isProcessing}
		>
			<ButtonText>Check my status</ButtonText>
			{isProcessing && <ButtonIcon icon={Loader} />}
		</Button>
	);

	const logoutBtn = (
		<Button variant="ghost" size="large" color="primary" label={"Sign out"} onPress={() => logoutCurrentAccount()}>
			<ButtonText>Sign out</ButtonText>
		</Button>
	);

	const webLayout = gtMobile;

	return (
		<Modal visible presentationStyle="formSheet" style={a.util_screen_outer}>
			<div
				// ScrollView
				style={{
					...a.flex_1,
					...t.atoms.bg,
				}}
				// contentContainerStyle={{ borderWidth: 0 }}
				// bounces={false}
			>
				<div
					style={{
						...a.flex_row,
						...a.justify_center,
						...(gtMobile ? a.pt_4xl : flatten([a.px_xl, a.pt_xl])),
					}}
				>
					<div
						style={{
							...a.flex_1,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						<div
							style={{
								...a.w_full,
								...a.justify_center,
								...a.align_center,
								...a.my_4xl,
							}}
						>
							<Logo width={120} />
						</div>

						<Text
							style={{
								...a.text_4xl,
								...a.font_heavy,
								...a.pb_sm,
							}}
						>
							You're in line
						</Text>
						<P style={t.atoms.text_contrast_medium}>
							There's been a rush of new users to Bluesky! We'll activate your account as soon as we can.
						</P>

						<div
							style={{
								...a.rounded_sm,
								...a.px_2xl,
								...a.py_4xl,
								...a.mt_2xl,
								...a.mb_md,
								...a.border,
								...t.atoms.bg_contrast_25,
								...t.atoms.border_contrast_medium,
							}}
						>
							{typeof placeInQueue === "number" && (
								<Text
									style={{
										...a.text_5xl,
										...a.text_center,
										...a.font_heavy,
										...a.mb_2xl,
									}}
								>
									{placeInQueue}
								</Text>
							)}
							<P style={a.text_center}>
								{typeof placeInQueue === "number" ? <>left to go.</> : <>You are in line.</>}{" "}
								{estimatedTime ? (
									<>We estimate {estimatedTime} until your account is ready.</>
								) : (
									<>We will let you know when your account is ready.</>
								)}
							</P>
						</div>

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
								{logoutBtn}
								{checkBtn}
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
						{checkBtn}
						{logoutBtn}
					</div>
				</div>
			)}
		</Modal>
	);
}

function msToString(ms: number | undefined): string | undefined {
	if (ms && ms > 0) {
		const estimatedTimeMins = Math.ceil(ms / 60e3);
		if (estimatedTimeMins > 59) {
			const estimatedTimeHrs = Math.round(estimatedTimeMins / 60);
			if (estimatedTimeHrs > 6) {
				// dont even bother
				return undefined;
			}
			// hours
			return `${estimatedTimeHrs} ${estimatedTimeHrs === 1 ? "hour" : "hours"}`;
		}
		// minutes
		return `${estimatedTimeMins} ${estimatedTimeMins === 1 ? "minute" : "minutes"}`;
	}
	return undefined;
}
