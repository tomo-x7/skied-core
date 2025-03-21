import * as EmailValidator from "email-validator";
import React, { useRef } from "react";

import { atoms as a } from "#/alf";
import { Loader } from "#/components/Loader";
import * as DateField from "#/components/forms/DateField";
import { FormError } from "#/components/forms/FormError";
import { HostingProvider } from "#/components/forms/HostingProvider";
import * as TextField from "#/components/forms/TextField";
import { Envelope_Stroke2_Corner0_Rounded as Envelope } from "#/components/icons/Envelope";
import { Lock_Stroke2_Corner0_Rounded as Lock } from "#/components/icons/Lock";
import { Ticket_Stroke2_Corner0_Rounded as Ticket } from "#/components/icons/Ticket";
import { isEmailMaybeInvalid } from "#/lib/strings/email";
import { ScreenTransition } from "#/screens/Login/ScreenTransition";
import { Policies } from "#/screens/Signup/StepInfo/Policies";
import { is13, is18, useSignupContext } from "#/screens/Signup/state";
import { BackNextButtons } from "../BackNextButtons";

function sanitizeDate(date: Date): Date {
	if (!date || date.toString() === "Invalid Date") {
		console.error("Create account: handled invalid date for birthDate", {
			hasDate: !!date,
		});
		return new Date();
	}
	return date;
}

export function StepInfo({
	onPressBack,
	isServerError,
	refetchServer,
	isLoadingStarterPack,
}: {
	onPressBack: () => void;
	isServerError: boolean;
	refetchServer: () => void;
	isLoadingStarterPack: boolean;
}) {
	const { state, dispatch } = useSignupContext();

	const inviteCodeValueRef = useRef<string>(state.inviteCode);
	const emailValueRef = useRef<string>(state.email);
	const prevEmailValueRef = useRef<string>(state.email);
	const passwordValueRef = useRef<string>(state.password);

	const emailInputRef = useRef<HTMLInputElement>(null);
	const passwordInputRef = useRef<HTMLInputElement>(null);
	const birthdateInputRef = useRef<HTMLInputElement>(null);

	const [hasWarnedEmail, setHasWarnedEmail] = React.useState<boolean>(false);

	const onNextPress = () => {
		const inviteCode = inviteCodeValueRef.current;
		const email = emailValueRef.current;
		const emailChanged = prevEmailValueRef.current !== email;
		const password = passwordValueRef.current;

		if (!is13(state.dateOfBirth)) {
			return;
		}

		if (state.serviceDescription?.inviteCodeRequired && !inviteCode) {
			return dispatch({
				type: "setError",
				value: "Please enter your invite code.",
				field: "invite-code",
			});
		}
		if (!email) {
			return dispatch({
				type: "setError",
				value: "Please enter your email.",
				field: "email",
			});
		}
		if (!EmailValidator.validate(email)) {
			return dispatch({
				type: "setError",
				value: "Your email appears to be invalid.",
				field: "email",
			});
		}
		if (emailChanged) {
			if (isEmailMaybeInvalid(email)) {
				prevEmailValueRef.current = email;
				setHasWarnedEmail(true);
				return dispatch({
					type: "setError",
					value: "Please double-check that you have entered your email address correctly.",
				});
			}
		} else if (hasWarnedEmail) {
			setHasWarnedEmail(false);
		}
		prevEmailValueRef.current = email;
		if (!password) {
			return dispatch({
				type: "setError",
				value: "Please choose your password.",
				field: "password",
			});
		}
		if (password.length < 8) {
			return dispatch({
				type: "setError",
				value: "Your password must be at least 8 characters long.",
				field: "password",
			});
		}

		dispatch({ type: "setInviteCode", value: inviteCode });
		dispatch({ type: "setEmail", value: email });
		dispatch({ type: "setPassword", value: password });
		dispatch({ type: "next" });
	};

	return (
		<ScreenTransition>
			<div style={a.gap_md}>
				<FormError error={state.error} />
				<HostingProvider
					minimal
					serviceUrl={state.serviceUrl}
					onSelectServiceUrl={(v) => dispatch({ type: "setServiceUrl", value: v })}
				/>
				{state.isLoading || isLoadingStarterPack ? (
					<div style={a.align_center}>
						<Loader size="xl" />
					</div>
				) : state.serviceDescription ? (
					<>
						{state.serviceDescription.inviteCodeRequired && (
							<div>
								<TextField.LabelText>Invite code</TextField.LabelText>
								<TextField.Root isInvalid={state.errorField === "invite-code"}>
									<TextField.Icon icon={Ticket} />
									<TextField.Input
										onChangeText={(value) => {
											inviteCodeValueRef.current = value.trim();
											if (state.errorField === "invite-code" && value.trim().length > 0) {
												dispatch({ type: "clearError" });
											}
										}}
										label={"Required for this provider"}
										defaultValue={state.inviteCode}
										autoCapitalize="none"
										autoComplete="email"
										returnKeyType="next"
									/>
								</TextField.Root>
							</div>
						)}
						<div>
							<TextField.LabelText>Email</TextField.LabelText>
							<TextField.Root isInvalid={state.errorField === "email"}>
								<TextField.Icon icon={Envelope} />
								<TextField.Input
									inputRef={emailInputRef}
									onChangeText={(value) => {
										emailValueRef.current = value.trim();
										if (hasWarnedEmail) {
											setHasWarnedEmail(false);
										}
										if (
											state.errorField === "email" &&
											value.trim().length > 0 &&
											EmailValidator.validate(value.trim())
										) {
											dispatch({ type: "clearError" });
										}
									}}
									label={"Enter your email address"}
									defaultValue={state.email}
									autoCapitalize="none"
									autoComplete="email"
									returnKeyType="next"
								/>
							</TextField.Root>
						</div>
						<div>
							<TextField.LabelText>Password</TextField.LabelText>
							<TextField.Root isInvalid={state.errorField === "password"}>
								<TextField.Icon icon={Lock} />
								<TextField.Input
									inputRef={passwordInputRef}
									onChangeText={(value) => {
										passwordValueRef.current = value;
										if (state.errorField === "password" && value.length >= 8) {
											dispatch({ type: "clearError" });
										}
									}}
									label={"Choose your password"}
									defaultValue={state.password}
									type="password"
									autoComplete="new-password"
									autoCapitalize="none"
									returnKeyType="next"
									// passwordRules="minlength: 8;"
								/>
							</TextField.Root>
						</div>
						<div>
							<DateField.LabelText>Your birth date</DateField.LabelText>
							<DateField.DateField
								inputRef={birthdateInputRef}
								value={state.dateOfBirth}
								onChangeDate={(date) => {
									dispatch({
										type: "setDateOfBirth",
										value: sanitizeDate(new Date(date)),
									});
								}}
								label={"Date of birth"}
								maximumDate={new Date()}
							/>
						</div>
						<Policies
							serviceDescription={state.serviceDescription}
							needsGuardian={!is18(state.dateOfBirth)}
							under13={!is13(state.dateOfBirth)}
						/>
					</>
				) : undefined}
			</div>
			<BackNextButtons
				hideNext={!is13(state.dateOfBirth)}
				showRetry={isServerError}
				isLoading={state.isLoading}
				onBackPress={onPressBack}
				onNextPress={onNextPress}
				onRetryPress={refetchServer}
				overrideNextText={hasWarnedEmail ? `It's correct` : undefined}
			/>
		</ScreenTransition>
	);
}
