import React, { useRef } from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { useThrottledValue } from "#/components/hooks/useThrottledValue";
import { At_Stroke2_Corner0_Rounded as At } from "#/components/icons/At";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { TimesLarge_Stroke2_Corner0_Rounded as Times } from "#/components/icons/Times";
import { MAX_SERVICE_HANDLE_LENGTH, createFullHandle, validateServiceHandle } from "#/lib/strings/handles";
import { ScreenTransition } from "#/screens/Login/ScreenTransition";
import { useSignupContext } from "#/screens/Signup/state";
import { useAgent } from "#/state/session";
import { BackNextButtons } from "./BackNextButtons";

export function StepHandle() {
	const t = useTheme();
	const { state, dispatch } = useSignupContext();
	const agent = useAgent();
	const handleValueRef = useRef<string>(state.handle);
	const [draftValue, setDraftValue] = React.useState(state.handle);
	const isLoading = useThrottledValue(state.isLoading, 500);

	const onNextPress = React.useCallback(async () => {
		const handle = handleValueRef.current.trim();
		dispatch({
			type: "setHandle",
			value: handle,
		});

		const newValidCheck = validateServiceHandle(handle, state.userDomain);
		if (!newValidCheck.overall) {
			return;
		}

		try {
			dispatch({ type: "setIsLoading", value: true });

			const res = await agent.resolveHandle({
				handle: createFullHandle(handle, state.userDomain),
			});

			if (res.data.did) {
				dispatch({
					type: "setError",
					value: "That handle is already taken.",
				});
				return;
			}
		} catch (e) {
			// Don't have to handle
		} finally {
			dispatch({ type: "setIsLoading", value: false });
		}
		// phoneVerificationRequired is actually whether a captcha is required
		if (!state.serviceDescription?.phoneVerificationRequired) {
			dispatch({
				type: "submit",
				task: { verificationCode: undefined, mutableProcessed: false },
			});
			return;
		}
		dispatch({ type: "next" });
	}, [dispatch, state.serviceDescription?.phoneVerificationRequired, state.userDomain, agent]);

	const onBackPress = React.useCallback(() => {
		const handle = handleValueRef.current.trim();
		dispatch({
			type: "setHandle",
			value: handle,
		});
		dispatch({ type: "prev" });
	}, [dispatch]);

	const validCheck = validateServiceHandle(draftValue, state.userDomain);
	return (
		<ScreenTransition>
			<View style={[a.gap_lg]}>
				<View>
					<TextField.Root>
						<TextField.Icon icon={At} />
						<TextField.Input
							testID="handleInput"
							onChangeText={(val) => {
								if (state.error) {
									dispatch({ type: "setError", value: "" });
								}

								// These need to always be in sync.
								handleValueRef.current = val;
								setDraftValue(val);
							}}
							label={"Type your desired username"}
							defaultValue={draftValue}
							autoCapitalize="none"
							autoCorrect={false}
							autoFocus
							autoComplete="off"
						/>
					</TextField.Root>
				</View>
				{draftValue !== "" && (
					<Text style={[a.text_md]}>
						<>
							Your full username will be{" "}
							<Text style={[a.text_md, a.font_bold]}>
								@{createFullHandle(draftValue, state.userDomain)}
							</Text>
						</>
					</Text>
				)}

				{draftValue !== "" && (
					<View style={[a.w_full, a.rounded_sm, a.border, a.p_md, a.gap_sm, t.atoms.border_contrast_low]}>
						{state.error ? (
							<View style={[a.w_full, a.flex_row, a.align_center, a.gap_sm]}>
								<IsValidIcon valid={false} />
								<Text style={[a.text_md, a.flex_1]}>{state.error}</Text>
							</View>
						) : undefined}
						{validCheck.hyphenStartOrEnd ? (
							<View style={[a.w_full, a.flex_row, a.align_center, a.gap_sm]}>
								<IsValidIcon valid={validCheck.handleChars} />
								<Text style={[a.text_md, a.flex_1]}>Only contains letters, numbers, and hyphens</Text>
							</View>
						) : (
							<View style={[a.w_full, a.flex_row, a.align_center, a.gap_sm]}>
								<IsValidIcon valid={validCheck.hyphenStartOrEnd} />
								<Text style={[a.text_md, a.flex_1]}>Doesn't begin or end with a hyphen</Text>
							</View>
						)}
						<View style={[a.w_full, a.flex_row, a.align_center, a.gap_sm]}>
							<IsValidIcon valid={validCheck.frontLength && validCheck.totalLength} />
							{!validCheck.totalLength || draftValue.length > MAX_SERVICE_HANDLE_LENGTH ? (
								<Text style={[a.text_md, a.flex_1]}>
									<>No longer than {MAX_SERVICE_HANDLE_LENGTH} characters</>
								</Text>
							) : (
								<Text style={[a.text_md, a.flex_1]}>At least 3 characters</Text>
							)}
						</View>
					</View>
				)}
			</View>
			<BackNextButtons
				isLoading={isLoading}
				isNextDisabled={!validCheck.overall}
				onBackPress={onBackPress}
				onNextPress={onNextPress}
			/>
		</ScreenTransition>
	);
}

function IsValidIcon({ valid }: { valid: boolean }) {
	const t = useTheme();
	if (!valid) {
		return <Times size="md" style={{ color: t.palette.negative_500 }} />;
	}
	return <Check size="md" style={{ color: t.palette.positive_700 }} />;
}
