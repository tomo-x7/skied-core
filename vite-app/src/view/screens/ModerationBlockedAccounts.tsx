import type { AppBskyActorDefs as ActorDefs } from "@atproto/api";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { atoms as a } from "#/alf";
import * as Layout from "#/components/Layout";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import type { CommonNavigatorParams } from "#/lib/routes/types";
import { cleanError } from "#/lib/strings/errors";
import { useMyBlockedAccountsQuery } from "#/state/queries/my-blocked-accounts";
import { useSetMinimalShellMode } from "#/state/shell";
import { ProfileCard } from "#/view/com/profile/ProfileCard";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { ErrorScreen } from "#/view/com/util/error/ErrorScreen";
import { Text } from "#/view/com/util/text/Text";

type Props = NativeStackScreenProps<CommonNavigatorParams, "ModerationBlockedAccounts">;
export function ModerationBlockedAccounts(props: Props) {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();
	const { isTabletOrDesktop } = useWebMediaQueries();

	const [isPTRing, setIsPTRing] = React.useState(false);
	const { data, isFetching, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMyBlockedAccountsQuery();
	const isEmpty = !isFetching && !data?.pages[0]?.blocks.length;
	const profiles = React.useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.blocks);
		}
		return [];
	}, [data]);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onRefresh = React.useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh my muted accounts", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = React.useCallback(async () => {
		if (isFetching || !hasNextPage || isError) return;

		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more of my muted accounts", { message: err });
		}
	}, [isFetching, hasNextPage, isError, fetchNextPage]);

	const renderItem = ({
		item,
		index,
	}: {
		item: ActorDefs.ProfileView;
		index: number;
	}) => <ProfileCard testID={`blockedAccount-${index}`} key={item.did} profile={item} noModFilter />;
	return (
		<Layout.Screen testID="blockedAccountsScreen">
			<Layout.Center style={[a.flex_1, { paddingBottom: 100 }]}>
				<ViewHeader title={"Blocked Accounts"} showOnDesktop />
				<Text
					type="sm"
					style={[
						styles.description,
						pal.text,
						isTabletOrDesktop && styles.descriptionDesktop,
						{
							marginTop: 20,
						},
					]}
				>
					Blocked accounts cannot reply in your threads, mention you, or otherwise interact with you. You will
					not see their content and they will be prevented from seeing yours.
				</Text>
				{isEmpty ? (
					<View style={[pal.border]}>
						{isError ? (
							<ErrorScreen title="Oops!" message={cleanError(error)} onPressTryAgain={refetch} />
						) : (
							<View style={[styles.empty, pal.viewLight]}>
								<Text type="lg" style={[pal.text, styles.emptyText]}>
									You have not blocked any accounts yet. To block an account, go to their profile and
									select "Block account" from the menu on their account.
								</Text>
							</View>
						)}
					</View>
				) : (
					<FlatList
						style={[!isTabletOrDesktop && styles.flex1]}
						data={profiles}
						keyExtractor={(item: ActorDefs.ProfileView) => item.did}
						refreshControl={
							<RefreshControl
								refreshing={isPTRing}
								onRefresh={onRefresh}
								tintColor={pal.colors.text}
								titleColor={pal.colors.text}
							/>
						}
						onEndReached={onEndReached}
						renderItem={renderItem}
						initialNumToRender={15}
						// FIXME(dan)

						ListFooterComponent={() => (
							<View style={styles.footer}>
								{(isFetching || isFetchingNextPage) && <ActivityIndicator />}
							</View>
						)}
						// @ts-ignore our .web version only -prf
						desktopFixedHeight
					/>
				)}
			</Layout.Center>
		</Layout.Screen>
	);
}

const styles = StyleSheet.create({
	title: {
		textAlign: "center",
		marginTop: 12,
		marginBottom: 12,
	},
	description: {
		textAlign: "center",
		paddingHorizontal: 30,
		marginBottom: 14,
	},
	descriptionDesktop: {
		marginTop: 14,
	},

	flex1: {
		flex: 1,
	},
	empty: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderRadius: 16,
		marginHorizontal: 24,
		marginTop: 10,
	},
	emptyText: {
		textAlign: "center",
	},

	footer: {
		height: 200,
		paddingTop: 20,
	},
});
