import type { AppBskyActorDefs, ModerationDecision } from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import React, { memo } from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { type MeasuredDimensions, runOnJS, runOnUI } from "react-native-reanimated";

import { atoms as a, useTheme } from "#/alf";
import { ArrowLeft_Stroke2_Corner0_Rounded as ArrowLeftIcon } from "#/components/icons/Arrow";
import { LabelsOnMe } from "#/components/moderation/LabelsOnMe";
import { ProfileHeaderAlerts } from "#/components/moderation/ProfileHeaderAlerts";
import { BACK_HITSLOP } from "#/lib/constants";
import { measureHandle, useHandleRef } from "#/lib/hooks/useHandleRef";
import type { NavigationProp } from "#/lib/routes/types";
import type { Shadow } from "#/state/cache/types";
import { useLightboxControls } from "#/state/lightbox";
import { useSession } from "#/state/session";
import { LoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { UserBanner } from "#/view/com/util/UserBanner";
import { GrowableAvatar } from "./GrowableAvatar";
import { GrowableBanner } from "./GrowableBanner";
import { StatusBarShadow } from "./StatusBarShadow";

interface Props {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	moderation: ModerationDecision;
	hideBackButton?: boolean;
	isPlaceholderProfile?: boolean;
}

let ProfileHeaderShell = ({
	children,
	profile,
	moderation,
	hideBackButton = false,
	isPlaceholderProfile,
}: React.PropsWithChildren<Props>): React.ReactNode => {
	const t = useTheme();
	const { currentAccount } = useSession();
	const { openLightbox } = useLightboxControls();
	const navigation = useNavigation<NavigationProp>();

	const aviRef = useHandleRef();

	const onPressBack = React.useCallback(() => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate("Home");
		}
	}, [navigation]);

	const _openLightbox = React.useCallback(
		(uri: string, thumbRect: MeasuredDimensions | null) => {
			openLightbox({
				images: [
					{
						uri,
						thumbUri: uri,
						thumbRect,
						dimensions: {
							// It's fine if it's actually smaller but we know it's 1:1.
							height: 1000,
							width: 1000,
						},
						thumbDimensions: null,
						type: "circle-avi",
					},
				],
				index: 0,
			});
		},
		[openLightbox],
	);

	const onPressAvi = React.useCallback(() => {
		const modui = moderation.ui("avatar");
		const avatar = profile.avatar;
		if (avatar && !(modui.blur && modui.noOverride)) {
			const aviHandle = aviRef.current;
			runOnUI(() => {
				"worklet";
				const rect = measureHandle(aviHandle);
				runOnJS(_openLightbox)(avatar, rect);
			})();
		}
	}, [profile, moderation, _openLightbox, aviRef]);

	const isMe = React.useMemo(() => currentAccount?.did === profile.did, [currentAccount, profile]);

	return (
		<View style={t.atoms.bg} pointerEvents={"box-none"}>
			<View pointerEvents={"box-none"} style={[a.relative, { height: 150 }]}>
				<StatusBarShadow />
				<GrowableBanner
					backButton={
						!hideBackButton && (
							<TouchableWithoutFeedback
								testID="profileHeaderBackBtn"
								onPress={onPressBack}
								hitSlop={BACK_HITSLOP}
								accessibilityRole="button"
								accessibilityLabel={"Back"}
								accessibilityHint=""
							>
								<View
									style={[
										styles.backBtnWrapper,
										{
											top: 10,
										},
									]}
								>
									<ArrowLeftIcon size="lg" fill="white" />
								</View>
							</TouchableWithoutFeedback>
						)
					}
				>
					{isPlaceholderProfile ? (
						<LoadingPlaceholder width="100%" height="100%" style={{ borderRadius: 0 }} />
					) : (
						<UserBanner
							type={profile.associated?.labeler ? "labeler" : "default"}
							banner={profile.banner}
							moderation={moderation.ui("banner")}
						/>
					)}
				</GrowableBanner>
			</View>

			{children}

			{!isPlaceholderProfile && (
				<View style={[a.px_lg, a.py_xs]} pointerEvents={"box-none"}>
					{isMe ? (
						<LabelsOnMe type="account" labels={profile.labels} />
					) : (
						<ProfileHeaderAlerts moderation={moderation} />
					)}
				</View>
			)}

			<GrowableAvatar style={styles.aviPosition}>
				<TouchableWithoutFeedback
					testID="profileHeaderAviButton"
					onPress={onPressAvi}
					accessibilityRole="image"
					accessibilityLabel={`View ${profile.handle}'s avatar`}
					accessibilityHint=""
				>
					<View
						style={[
							t.atoms.bg,
							{ borderColor: t.atoms.bg.backgroundColor },
							styles.avi,
							profile.associated?.labeler && styles.aviLabeler,
						]}
					>
						<View ref={aviRef} collapsable={false}>
							<UserAvatar
								type={profile.associated?.labeler ? "labeler" : "user"}
								size={90}
								avatar={profile.avatar}
								moderation={moderation.ui("avatar")}
							/>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</GrowableAvatar>
		</View>
	);
};
ProfileHeaderShell = memo(ProfileHeaderShell);
export { ProfileHeaderShell };

const styles = StyleSheet.create({
	backBtnWrapper: {
		position: "absolute",
		left: 10,
		width: 30,
		height: 30,
		overflow: "hidden",
		borderRadius: 15,
		cursor: "pointer",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		alignItems: "center",
		justifyContent: "center",
	},
	backBtn: {
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
	},
	aviPosition: {
		position: "absolute",
		top: 110,
		left: 10,
	},
	avi: {
		width: 94,
		height: 94,
		borderRadius: 47,
		borderWidth: 2,
	},
	aviLabeler: {
		borderRadius: 10,
	},
});
