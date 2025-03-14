import type { AppBskyActorDefs } from "@atproto/api";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import type { Image as RNImage } from "react-native-image-crop-picker";
import Animated from "react-native-reanimated";

import { useTheme } from "#/lib/ThemeContext";
import { MAX_DESCRIPTION, MAX_DISPLAY_NAME } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";
import { compressIfNeeded } from "#/lib/media/manip";
import { cleanError } from "#/lib/strings/errors";
import { enforceLen } from "#/lib/strings/helpers";
import { colors, gradients, s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";
import { useProfileUpdateMutation } from "#/state/queries/profile";
import * as Toast from "#/view/com/util/Toast";
import { EditableUserAvatar } from "#/view/com/util/UserAvatar";
import { UserBanner } from "#/view/com/util/UserBanner";
import { Text } from "#/view/com/util/text/Text";
import { ErrorMessage } from "../util/error/ErrorMessage";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const snapPoints = ["fullscreen"];

export function Component({
	profile,
	onUpdate,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	onUpdate?: () => void;
}) {
	const pal = usePalette("default");
	const theme = useTheme();
	const { closeModal } = useModalControls();
	const updateMutation = useProfileUpdateMutation();
	const [imageError, setImageError] = useState<string>("");
	const [displayName, setDisplayName] = useState<string>(profile.displayName || "");
	const [description, setDescription] = useState<string>(profile.description || "");
	const [userBanner, setUserBanner] = useState<string | undefined | null>(profile.banner);
	const [userAvatar, setUserAvatar] = useState<string | undefined | null>(profile.avatar);
	const [newUserBanner, setNewUserBanner] = useState<RNImage | undefined | null>();
	const [newUserAvatar, setNewUserAvatar] = useState<RNImage | undefined | null>();
	const onPressCancel = () => {
		closeModal();
	};
	const onSelectNewAvatar = useCallback(async (img: RNImage | null) => {
		setImageError("");
		if (img === null) {
			setNewUserAvatar(null);
			setUserAvatar(null);
			return;
		}
		try {
			const finalImg = await compressIfNeeded(img, 1000000);
			setNewUserAvatar(finalImg);
			setUserAvatar(finalImg.path);
		} catch (e: any) {
			setImageError(cleanError(e));
		}
	}, []);

	const onSelectNewBanner = useCallback(async (img: RNImage | null) => {
		setImageError("");
		if (!img) {
			setNewUserBanner(null);
			setUserBanner(null);
			return;
		}
		try {
			const finalImg = await compressIfNeeded(img, 1000000);
			setNewUserBanner(finalImg);
			setUserBanner(finalImg.path);
		} catch (e: any) {
			setImageError(cleanError(e));
		}
	}, []);

	const onPressSave = useCallback(async () => {
		setImageError("");
		try {
			await updateMutation.mutateAsync({
				profile,
				updates: {
					displayName,
					description,
				},
				newUserAvatar,
				newUserBanner,
			});
			Toast.show("Profile updated");
			onUpdate?.();
			closeModal();
		} catch (e: any) {
			console.error("Failed to update user profile", { message: String(e) });
		}
	}, [updateMutation, profile, onUpdate, closeModal, displayName, description, newUserAvatar, newUserBanner]);

	return (
		<KeyboardAvoidingView style={s.flex1} behavior="height">
			<ScrollView style={[pal.view]} testID="editProfileModal">
				<Text style={[styles.title, pal.text]}>Edit my profile</Text>
				<View style={styles.photos}>
					<UserBanner banner={userBanner} onSelectNewBanner={onSelectNewBanner} />
					<View style={[styles.avi, { borderColor: pal.colors.background }]}>
						<EditableUserAvatar size={80} avatar={userAvatar} onSelectNewAvatar={onSelectNewAvatar} />
					</View>
				</View>
				{updateMutation.isError && (
					<View style={styles.errorContainer}>
						<ErrorMessage message={cleanError(updateMutation.error)} />
					</View>
				)}
				{imageError !== "" && (
					<View style={styles.errorContainer}>
						<ErrorMessage message={imageError} />
					</View>
				)}
				<View style={styles.form}>
					<View>
						<Text style={[styles.label, pal.text]}>Display Name</Text>
						<TextInput
							testID="editProfileDisplayNameInput"
							style={[styles.textInput, pal.border, pal.text]}
							placeholder={"e.g. Alice Roberts"}
							placeholderTextColor={colors.gray4}
							value={displayName}
							onChangeText={(v) => setDisplayName(enforceLen(v, MAX_DISPLAY_NAME))}
							accessible={true}
							accessibilityLabel={"Display name"}
							accessibilityHint={"Edit your display name"}
						/>
					</View>
					<View style={s.pb10}>
						<Text style={[styles.label, pal.text]}>Description</Text>
						<TextInput
							testID="editProfileDescriptionInput"
							style={[styles.textArea, pal.border, pal.text]}
							placeholder={"e.g. Artist, dog-lover, and avid reader."}
							placeholderTextColor={colors.gray4}
							keyboardAppearance={theme.colorScheme}
							multiline
							value={description}
							onChangeText={(v) => setDescription(enforceLen(v, MAX_DESCRIPTION))}
							accessible={true}
							accessibilityLabel={"Description"}
							accessibilityHint={"Edit your profile description"}
						/>
					</View>
					{updateMutation.isPending ? (
						<View style={[styles.btn, s.mt10, { backgroundColor: colors.gray2 }]}>
							<ActivityIndicator />
						</View>
					) : (
						<TouchableOpacity
							testID="editProfileSaveBtn"
							style={s.mt10}
							onPress={onPressSave}
							accessibilityRole="button"
							accessibilityLabel={"Save"}
							accessibilityHint={"Saves any changes to your profile"}
						>
							<LinearGradient
								colors={[gradients.blueLight.start, gradients.blueLight.end]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={[styles.btn]}
							>
								<Text style={[s.white, s.bold]}>Save Changes</Text>
							</LinearGradient>
						</TouchableOpacity>
					)}
					{!updateMutation.isPending && (
						<AnimatedTouchableOpacity
							exiting={undefined}
							testID="editProfileCancelBtn"
							style={s.mt5}
							onPress={onPressCancel}
							accessibilityRole="button"
							accessibilityLabel={"Cancel profile editing"}
							accessibilityHint=""
							onAccessibilityEscape={onPressCancel}
						>
							<View style={[styles.btn]}>
								<Text style={[s.black, s.bold, pal.text]}>Cancel</Text>
							</View>
						</AnimatedTouchableOpacity>
					)}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	title: {
		textAlign: "center",
		fontWeight: "600",
		fontSize: 24,
		marginBottom: 18,
	},
	label: {
		fontWeight: "600",
		paddingHorizontal: 4,
		paddingBottom: 4,
		marginTop: 20,
	},
	form: {
		paddingHorizontal: 14,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 14,
		paddingVertical: 10,
		fontSize: 16,
	},
	textArea: {
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingTop: 10,
		fontSize: 16,
		height: 120,
		textAlignVertical: "top",
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		borderRadius: 32,
		padding: 10,
		marginBottom: 10,
	},
	avi: {
		position: "absolute",
		top: 80,
		left: 24,
		width: 84,
		height: 84,
		borderWidth: 2,
		borderRadius: 42,
	},
	photos: {
		marginBottom: 36,
		marginHorizontal: -14,
	},
	errorContainer: { marginTop: 20 },
});
