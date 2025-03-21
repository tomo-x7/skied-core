import { nanoid } from "nanoid/non-secure";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { FormError } from "#/components/forms/FormError";
import { createFullHandle } from "#/lib/strings/handles";
import { ScreenTransition } from "#/screens/Login/ScreenTransition";
import { CaptchaWebView } from "#/screens/Signup/StepCaptcha/CaptchaWebView";
import { useSignupContext } from "#/screens/Signup/state";
import { BackNextButtons } from "../BackNextButtons";

const CAPTCHA_PATH = "/gate/signup";

export function StepCaptcha() {
	const theme = useTheme();
	const { state, dispatch } = useSignupContext();

	const [completed, setCompleted] = React.useState(false);

	const stateParam = React.useMemo(() => nanoid(15), []);
	const url = React.useMemo(() => {
		const newUrl = new URL(state.serviceUrl);
		newUrl.pathname = CAPTCHA_PATH;
		newUrl.searchParams.set("handle", createFullHandle(state.handle, state.userDomain));
		newUrl.searchParams.set("state", stateParam);
		newUrl.searchParams.set("colorScheme", theme.name);

		return newUrl.href;
	}, [state.serviceUrl, state.handle, state.userDomain, stateParam, theme.name]);

	const onSuccess = React.useCallback(
		(code: string) => {
			setCompleted(true);
			dispatch({
				type: "submit",
				task: { verificationCode: code, mutableProcessed: false },
			});
		},
		[dispatch],
	);

	const onError = React.useCallback(
		(error?: unknown) => {
			dispatch({
				type: "setError",
				value: "Error receiving captcha response.",
			});
			console.error("Signup Flow Error", {
				registrationHandle: state.handle,
				error,
			});
		},
		[dispatch, state.handle],
	);

	const onBackPress = React.useCallback(() => {
		console.error("Signup Flow Error", {
			errorMessage: "User went back from captcha step. Possibly encountered an error.",
			registrationHandle: state.handle,
		});

		dispatch({ type: "prev" });
	}, [dispatch, state.handle]);

	return (
		<ScreenTransition>
			<div style={a.gap_lg}>
				<div
					style={{
						...a.w_full,
						...a.overflow_hidden,
						...{ minHeight: 510 },
						...(completed && { ...a.align_center, ...a.justify_center }),
					}}
				>
					{!completed ? (
						<CaptchaWebView
							url={url}
							stateParam={stateParam}
							// state={state}
							onSuccess={onSuccess}
							onError={onError}
						/>
					) : (
						<ActivityIndicator size="large" />
					)}
				</div>
				<FormError error={state.error} />
			</div>
			<BackNextButtons hideNext isLoading={state.isLoading} onBackPress={onBackPress} />
		</ScreenTransition>
	);
}
