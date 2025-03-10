import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { atoms as a, useTheme } from "#/alf";
import { AppLanguageDropdown } from "#/components/AppLanguageDropdown";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { ErrorBoundary } from "#/view/com/util/ErrorBoundary";
import { Logo } from "#/view/icons/Logo";
import { Logotype } from "#/view/icons/Logotype";
import { CenteredView } from "../util/Views";

export const SplashScreen = ({
	onPressSignin,
	onPressCreateAccount,
}: {
	onPressSignin: () => void;
	onPressCreateAccount: () => void;
}) => {
	const t = useTheme();

	const insets = useSafeAreaInsets();

	return (
		<CenteredView style={[a.h_full, a.flex_1]}>
			<ErrorBoundary>
				<View style={[{ flex: 1 }, a.justify_center, a.align_center]}>
					<Logo width={92} fill="sky" />

					<View style={[a.pb_sm, a.pt_5xl]}>
						<Logotype width={161} fill={t.atoms.text.color} />
					</View>

					<Text style={[a.text_md, a.font_bold, t.atoms.text_contrast_medium]}>What's up?</Text>
				</View>
				<View testID="signinOrCreateAccount" style={[a.px_xl, a.gap_md, a.pb_2xl]}>
					<Button
						testID="createAccountButton"
						onPress={onPressCreateAccount}
						label={"Create new account"}
						accessibilityHint={"Opens flow to create a new Bluesky account"}
						size="large"
						variant="solid"
						color="primary"
					>
						<ButtonText>Create account</ButtonText>
					</Button>
					<Button
						testID="signInButton"
						onPress={onPressSignin}
						label={"Sign in"}
						accessibilityHint={"Opens flow to sign in to your existing Bluesky account"}
						size="large"
						variant="solid"
						color="secondary"
					>
						<ButtonText>Sign in</ButtonText>
					</Button>
				</View>
				<View style={[a.px_lg, a.pt_md, a.pb_2xl, a.justify_center, a.align_center]}>
					<AppLanguageDropdown />
				</View>
				<View style={{ height: insets.bottom }} />
			</ErrorBoundary>
		</CenteredView>
	);
};
