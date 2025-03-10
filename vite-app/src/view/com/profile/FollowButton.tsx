import { type StyleProp, type TextStyle, View } from "react-native";

import type { Shadow } from "#/state/cache/types";
import { useProfileFollowMutationQueue } from "#/state/queries/profile";
import type * as bsky from "#/types/bsky";
import * as Toast from "../util/Toast";
import { Button, type ButtonType } from "../util/forms/Button";

export function FollowButton({
	unfollowedType = "inverted",
	followedType = "default",
	profile,
	labelStyle,
	logContext,
	onFollow,
}: {
	unfollowedType?: ButtonType;
	followedType?: ButtonType;
	profile: Shadow<bsky.profile.AnyProfileView>;
	labelStyle?: StyleProp<TextStyle>;
	logContext: "ProfileCard" | "StarterPackProfilesList";
	onFollow?: () => void;
}) {
	const [queueFollow, queueUnfollow] = useProfileFollowMutationQueue(profile, logContext);

	const onPressFollow = async () => {
		try {
			await queueFollow();
			onFollow?.();
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				Toast.show("An issue occurred, please try again.", "xmark");
			}
		}
	};

	const onPressUnfollow = async () => {
		try {
			await queueUnfollow();
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				Toast.show("An issue occurred, please try again.", "xmark");
			}
		}
	};

	if (!profile.viewer) {
		return <View />;
	}

	if (profile.viewer.following) {
		return (
			<Button
				type={followedType}
				labelStyle={labelStyle}
				onPress={onPressUnfollow}
				label={msg({ message: "Unfollow", context: "action" })}
			/>
		);
	} else if (!profile.viewer.followedBy) {
		return (
			<Button
				type={unfollowedType}
				labelStyle={labelStyle}
				onPress={onPressFollow}
				label={msg({ message: "Follow", context: "action" })}
			/>
		);
	} else {
		return (
			<Button
				type={unfollowedType}
				labelStyle={labelStyle}
				onPress={onPressFollow}
				label={msg({ message: "Follow Back", context: "action" })}
			/>
		);
	}
}
