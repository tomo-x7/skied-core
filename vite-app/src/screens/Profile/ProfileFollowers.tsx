import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { useProfileQuery } from "#/state/queries/profile";
import { useResolveDidQuery } from "#/state/queries/resolve-uri";
import { useSetMinimalShellMode } from "#/state/shell";
import { ProfileFollowers as ProfileFollowersComponent } from "#/view/com/profile/ProfileFollowers";

type Props = NativeStackScreenProps<CommonNavigatorParams, "ProfileFollowers">;
export const ProfileFollowersScreen = ({ route }: Props) => {
	const { name } = route.params;
	const setMinimalShellMode = useSetMinimalShellMode();

	const { data: resolvedDid } = useResolveDidQuery(name);
	const { data: profile } = useProfileQuery({
		did: resolvedDid,
	});

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					{profile && (
						<>
							<Layout.Header.TitleText>
								{sanitizeDisplayName(profile.displayName || profile.handle)}
							</Layout.Header.TitleText>
							<Layout.Header.SubtitleText>
								{profile.followersCount ?? 0} {profile.followersCount === 1 ? "follower" : "followers"}
							</Layout.Header.SubtitleText>
						</>
					)}
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<ProfileFollowersComponent name={name} />
		</Layout.Screen>
	);
};
