import { AppBskyGraphStarterpack } from "@atproto/api";
import React from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { AppLanguageDropdown } from "#/components/AppLanguageDropdown";
import { Divider } from "#/components/Divider";
import { LinearGradientBackground } from "#/components/LinearGradientBackground";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { FEEDBACK_FORM_URL } from "#/lib/constants";
import { StepCaptcha } from "#/screens/Signup/StepCaptcha";
import { StepHandle } from "#/screens/Signup/StepHandle";
import { StepInfo } from "#/screens/Signup/StepInfo";
import { SignupContext, SignupStep, initialState, reducer, useSubmitSignup } from "#/screens/Signup/state";
import { useServiceQuery } from "#/state/queries/service";
import { useStarterPackQuery } from "#/state/queries/starter-packs";
import { useActiveStarterPack } from "#/state/shell/starter-pack";
import * as bsky from "#/types/bsky";
import { LoggedOutLayout } from "#/view/com/util/layouts/LoggedOutLayout";

export function Signup({ onPressBack }: { onPressBack: () => void }) {
	const t = useTheme();
	const [state, dispatch] = React.useReducer(reducer, initialState);
	const { gtMobile } = useBreakpoints();
	const submit = useSubmitSignup();

	const activeStarterPack = useActiveStarterPack();
	const {
		data: starterPack,
		isFetching: isFetchingStarterPack,
		isError: isErrorStarterPack,
	} = useStarterPackQuery({
		uri: activeStarterPack?.uri,
	});

	const [isFetchedAtMount] = React.useState(starterPack != null);
	const showStarterPackCard = activeStarterPack?.uri && !isFetchingStarterPack && starterPack;

	const { data: serviceInfo, isFetching, isError, refetch } = useServiceQuery(state.serviceUrl);

	React.useEffect(() => {
		if (isFetching) {
			dispatch({ type: "setIsLoading", value: true });
		} else if (!isFetching) {
			dispatch({ type: "setIsLoading", value: false });
		}
	}, [isFetching]);

	React.useEffect(() => {
		if (isError) {
			dispatch({ type: "setServiceDescription", value: undefined });
			dispatch({
				type: "setError",
				value: "Unable to contact your service. Please check your Internet connection.",
			});
		} else if (serviceInfo) {
			dispatch({ type: "setServiceDescription", value: serviceInfo });
			dispatch({ type: "setError", value: "" });
		}
	}, [serviceInfo, isError]);

	React.useEffect(() => {
		if (state.pendingSubmit) {
			if (!state.pendingSubmit.mutableProcessed) {
				state.pendingSubmit.mutableProcessed = true;
				submit(state, dispatch);
			}
		}
	}, [state, submit]);

	return (
		<SignupContext.Provider value={{ state, dispatch }}>
			<LoggedOutLayout
				leadin=""
				title={"Create Account"}
				description={`We're so excited to have you join us!`}
				scrollable
			>
				<div style={a.flex_1}>
					{showStarterPackCard &&
					bsky.dangerousIsType<AppBskyGraphStarterpack.Record>(
						starterPack.record,
						AppBskyGraphStarterpack.isRecord,
					) ? (
						<div
						// Animated.View
						// entering={!isFetchedAtMount ? FadeIn : undefined}
						>
							<LinearGradientBackground
								style={{
									...a.mx_lg,
									...a.p_lg,
									...a.gap_sm,
									...a.rounded_sm,
								}}
							>
								<Text
									style={{
										...a.font_bold,
										...a.text_xl,
										...{ color: "white" },
									}}
								>
									{starterPack.record.name}
								</Text>
								<Text style={{ color: "white" }}>
									{starterPack.feeds?.length ? (
										<>
											You'll follow the suggested users and feeds once you finish creating your
											account!
										</>
									) : (
										<>You'll follow the suggested users once you finish creating your account!</>
									)}
								</Text>
							</LinearGradientBackground>
						</div>
					) : null}
					<div
						style={{
							...a.flex_1,
							...a.px_xl,
							...a.pt_2xl,
							...(!gtMobile && { paddingBottom: 100 }),
						}}
					>
						<div
							style={{
								...a.gap_sm,
								...a.pb_3xl,
							}}
						>
							<Text
								style={{
									...a.font_bold,
									...t.atoms.text_contrast_medium,
								}}
							>
								<>
									Step {state.activeStep + 1} of{" "}
									{state.serviceDescription && !state.serviceDescription.phoneVerificationRequired
										? "2"
										: "3"}
								</>
							</Text>
							<Text
								style={{
									...a.text_3xl,
									...a.font_bold,
								}}
							>
								{state.activeStep === SignupStep.INFO ? (
									<>Your account</>
								) : state.activeStep === SignupStep.HANDLE ? (
									<>Choose your username</>
								) : (
									<>Complete the challenge</>
								)}
							</Text>
						</div>

						<div
						// LayoutAnimationConfig
						// skipEntering
						// skipExiting
						>
							{state.activeStep === SignupStep.INFO ? (
								<StepInfo
									onPressBack={onPressBack}
									isLoadingStarterPack={isFetchingStarterPack && !isErrorStarterPack}
									isServerError={isError}
									refetchServer={refetch}
								/>
							) : state.activeStep === SignupStep.HANDLE ? (
								<StepHandle />
							) : (
								<StepCaptcha />
							)}
						</div>

						<Divider />

						<div
							style={{
								...a.w_full,
								...a.py_lg,
								...a.flex_row,
								...a.gap_lg,
								...a.align_center,
							}}
						>
							<AppLanguageDropdown />
							<Text
								style={{
									...t.atoms.text_contrast_medium,
									...(!gtMobile && a.text_md),
								}}
							>
								Having trouble?{" "}
								<InlineLinkText
									label={"Contact support"}
									to={FEEDBACK_FORM_URL({ email: state.email })}
									style={!gtMobile ? a.text_md : undefined}
								>
									Contact support
								</InlineLinkText>
							</Text>
						</div>
					</div>
				</div>
			</LoggedOutLayout>
		</SignupContext.Provider>
	);
}
