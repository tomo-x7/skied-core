import type { AppBskyActorDefs } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import { FilterTimeline_Stroke2_Corner0_Rounded as FilterTimeline } from "#/components/icons/FilterTimeline";
import { FloppyDisk_Stroke2_Corner0_Rounded as SaveIcon } from "#/components/icons/FloppyDisk";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import type { CommonNavigatorParams, NavigationProp } from "#/lib/routes/types";
import { colors, s } from "#/lib/styles";
import { NoFollowingFeed } from "#/screens/Feeds/NoFollowingFeed";
import { NoSavedFeedsOfAnyType } from "#/screens/Feeds/NoSavedFeedsOfAnyType";
import { useOverwriteSavedFeedsMutation, usePreferencesQuery } from "#/state/queries/preferences";
import type { UsePreferencesQueryResponse } from "#/state/queries/preferences/types";
import { useSetMinimalShellMode } from "#/state/shell";
import { FeedSourceCard } from "#/view/com/feeds/FeedSourceCard";
import { TextLink } from "#/view/com/util/Link";
import * as Toast from "#/view/com/util/Toast";
import { Text } from "#/view/com/util/text/Text";

type Props = NativeStackScreenProps<CommonNavigatorParams, "SavedFeeds">;
export function SavedFeeds(props: Props) {
	const { data: preferences } = usePreferencesQuery();
	if (!preferences) {
		return <View />;
	}
	return <SavedFeedsInner preferences={preferences} />;
}

function SavedFeedsInner({
	preferences,
}: {
	preferences: UsePreferencesQueryResponse;
}) {
	const pal = usePalette("default");
	const { isMobile, isDesktop } = useWebMediaQueries();
	const setMinimalShellMode = useSetMinimalShellMode();
	const { mutateAsync: overwriteSavedFeeds, isPending: isOverwritePending } = useOverwriteSavedFeedsMutation();
	const navigation = useNavigation<NavigationProp>();

	/*
	 * Use optimistic data if exists and no error, otherwise fallback to remote
	 * data
	 */
	const [currentFeeds, setCurrentFeeds] = React.useState(() => preferences.savedFeeds || []);
	const hasUnsavedChanges = currentFeeds !== preferences.savedFeeds;
	const pinnedFeeds = currentFeeds.filter((f) => f.pinned);
	const unpinnedFeeds = currentFeeds.filter((f) => !f.pinned);
	const noSavedFeedsOfAnyType = pinnedFeeds.length + unpinnedFeeds.length === 0;
	const noFollowingFeed = currentFeeds.every((f) => f.type !== "timeline") && !noSavedFeedsOfAnyType;

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onSaveChanges = React.useCallback(async () => {
		try {
			await overwriteSavedFeeds(currentFeeds);
			Toast.show("Feeds updated!");
			navigation.navigate("Feeds");
		} catch (e) {
			Toast.show("There was an issue contacting the server", "xmark");
			console.error("Failed to toggle pinned feed", { message: e });
		}
	}, [overwriteSavedFeeds, currentFeeds, navigation]);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content align="left">
					<Layout.Header.TitleText>Feeds</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Button
					testID="saveChangesBtn"
					size="small"
					variant={hasUnsavedChanges ? "solid" : "solid"}
					color={hasUnsavedChanges ? "primary" : "secondary"}
					onPress={onSaveChanges}
					label={"Save changes"}
					disabled={isOverwritePending || !hasUnsavedChanges}
				>
					<ButtonIcon icon={isOverwritePending ? Loader : SaveIcon} />
					<ButtonText>{isDesktop ? <>Save changes</> : <>Save</>}</ButtonText>
				</Button>
			</Layout.Header.Outer>

			<Layout.Content>
				{noSavedFeedsOfAnyType && (
					<View style={[pal.border, a.border_b]}>
						<NoSavedFeedsOfAnyType />
					</View>
				)}

				<View style={[pal.text, pal.border, styles.title]}>
					<Text type="title" style={pal.text}>
						Pinned Feeds
					</Text>
				</View>

				{preferences ? (
					!pinnedFeeds.length ? (
						<View style={[pal.border, isMobile && s.flex1, pal.viewLight, styles.empty]}>
							<Text type="lg" style={[pal.text]}>
								You don't have any pinned feeds.
							</Text>
						</View>
					) : (
						pinnedFeeds.map((f) => (
							<ListItem
								key={f.id}
								feed={f}
								isPinned
								currentFeeds={currentFeeds}
								setCurrentFeeds={setCurrentFeeds}
								preferences={preferences}
							/>
						))
					)
				) : (
					<ActivityIndicator style={{ marginTop: 20 }} />
				)}

				{noFollowingFeed && (
					<View style={[pal.border, a.border_b]}>
						<NoFollowingFeed />
					</View>
				)}

				<View style={[pal.text, pal.border, styles.title]}>
					<Text type="title" style={pal.text}>
						Saved Feeds
					</Text>
				</View>
				{preferences ? (
					!unpinnedFeeds.length ? (
						<View style={[pal.border, isMobile && s.flex1, pal.viewLight, styles.empty]}>
							<Text type="lg" style={[pal.text]}>
								You don't have any saved feeds.
							</Text>
						</View>
					) : (
						unpinnedFeeds.map((f) => (
							<ListItem
								key={f.id}
								feed={f}
								isPinned={false}
								currentFeeds={currentFeeds}
								setCurrentFeeds={setCurrentFeeds}
								preferences={preferences}
							/>
						))
					)
				) : (
					<ActivityIndicator style={{ marginTop: 20 }} />
				)}

				<View style={styles.footerText}>
					<Text type="sm" style={pal.textLight}>
						<>
							Feeds are custom algorithms that users build with a little coding expertise.{" "}
							<TextLink
								type="sm"
								style={pal.link}
								href="https://github.com/bluesky-social/feed-generator"
								text={"See this guide"}
							/>{" "}
							for more information.
						</>
					</Text>
				</View>
			</Layout.Content>
		</Layout.Screen>
	);
}

function ListItem({
	feed,
	isPinned,
	currentFeeds,
	setCurrentFeeds,
}: {
	feed: AppBskyActorDefs.SavedFeed;
	isPinned: boolean;
	currentFeeds: AppBskyActorDefs.SavedFeed[];
	setCurrentFeeds: React.Dispatch<AppBskyActorDefs.SavedFeed[]>;
	preferences: UsePreferencesQueryResponse;
}) {
	const pal = usePalette("default");
	const feedUri = feed.value;

	const onTogglePinned = React.useCallback(async () => {
		setCurrentFeeds(currentFeeds.map((f) => (f.id === feed.id ? { ...feed, pinned: !feed.pinned } : f)));
	}, [feed, currentFeeds, setCurrentFeeds]);

	const onPressUp = React.useCallback(async () => {
		if (!isPinned) return;

		const nextFeeds = currentFeeds.slice();
		const ids = currentFeeds.map((f) => f.id);
		const index = ids.indexOf(feed.id);
		const nextIndex = index - 1;

		if (index === -1 || index === 0) return;
		[nextFeeds[index], nextFeeds[nextIndex]] = [nextFeeds[nextIndex], nextFeeds[index]];

		setCurrentFeeds(nextFeeds);
	}, [feed, isPinned, setCurrentFeeds, currentFeeds]);

	const onPressDown = React.useCallback(async () => {
		if (!isPinned) return;

		const nextFeeds = currentFeeds.slice();
		const ids = currentFeeds.map((f) => f.id);
		const index = ids.indexOf(feed.id);
		const nextIndex = index + 1;

		if (index === -1 || index >= nextFeeds.filter((f) => f.pinned).length - 1) return;
		[nextFeeds[index], nextFeeds[nextIndex]] = [nextFeeds[nextIndex], nextFeeds[index]];

		setCurrentFeeds(nextFeeds);
	}, [feed, isPinned, setCurrentFeeds, currentFeeds]);

	const onPressRemove = React.useCallback(async () => {
		setCurrentFeeds(currentFeeds.filter((f) => f.id !== feed.id));
	}, [feed, currentFeeds, setCurrentFeeds]);

	return (
		<Animated.View style={[styles.itemContainer, pal.border]} layout={LinearTransition.duration(100)}>
			{feed.type === "timeline" ? (
				<FollowingFeedCard />
			) : (
				<FeedSourceCard
					key={feedUri}
					feedUri={feedUri}
					style={[isPinned && { paddingRight: 8 }]}
					showMinimalPlaceholder
					hideTopBorder={true}
				/>
			)}
			{isPinned ? (
				<>
					<Pressable
						accessibilityRole="button"
						onPress={onPressUp}
						hitSlop={5}
						style={(state) => ({
							backgroundColor: pal.viewLight.backgroundColor,
							paddingHorizontal: 12,
							paddingVertical: 10,
							borderRadius: 4,
							marginRight: 8,
							opacity: state.hovered || state.pressed ? 0.5 : 1,
						})}
						testID={`feed-${feed.type}-moveUp`}
					>
						{/* @ts-ignore */}
						<FontAwesomeIcon icon="arrow-up" size={14} style={[pal.textLight]} />
					</Pressable>
					<Pressable
						accessibilityRole="button"
						onPress={onPressDown}
						hitSlop={5}
						style={(state) => ({
							backgroundColor: pal.viewLight.backgroundColor,
							paddingHorizontal: 12,
							paddingVertical: 10,
							borderRadius: 4,
							marginRight: 8,
							opacity: state.hovered || state.pressed ? 0.5 : 1,
						})}
						testID={`feed-${feed.type}-moveDown`}
					>
						{/* @ts-ignore */}
						<FontAwesomeIcon icon="arrow-down" size={14} style={[pal.textLight]} />
					</Pressable>
				</>
			) : (
				<Pressable
					testID={`feed-${feedUri}-toggleSave`}
					accessibilityRole="button"
					accessibilityLabel={"Remove from my feeds"}
					accessibilityHint=""
					onPress={onPressRemove}
					hitSlop={5}
					style={(state) => ({
						marginRight: 8,
						paddingHorizontal: 12,
						paddingVertical: 10,
						borderRadius: 4,
						opacity: state.hovered || state.focused ? 0.5 : 1,
					})}
				>
					{/* @ts-ignore */}
					<FontAwesomeIcon icon={["far", "trash-can"]} size={19} color={pal.colors.icon} />
				</Pressable>
			)}
			<View style={{ paddingRight: 16 }}>
				<Pressable
					accessibilityRole="button"
					hitSlop={5}
					onPress={onTogglePinned}
					style={(state) => ({
						backgroundColor: pal.viewLight.backgroundColor,
						paddingHorizontal: 12,
						paddingVertical: 10,
						borderRadius: 4,
						opacity: state.hovered || state.focused ? 0.5 : 1,
					})}
					testID={`feed-${feed.type}-togglePin`}
				>
					{/* @ts-ignore */}
					<FontAwesomeIcon icon="thumb-tack" size={14} color={isPinned ? colors.blue3 : pal.colors.icon} />
				</Pressable>
			</View>
		</Animated.View>
	);
}

function FollowingFeedCard() {
	const t = useTheme();
	return (
		<View
			style={[
				a.flex_row,
				a.align_center,
				a.flex_1,
				{
					paddingHorizontal: 18,
					paddingVertical: 20,
				},
			]}
		>
			<View
				style={[
					a.align_center,
					a.justify_center,
					a.rounded_sm,
					{
						width: 36,
						height: 36,
						backgroundColor: t.palette.primary_500,
						marginRight: 10,
					},
				]}
			>
				<FilterTimeline
					style={[
						{
							width: 22,
							height: 22,
						},
					]}
					fill={t.palette.white}
				/>
			</View>
			<View style={{ flex: 1, flexDirection: "row", gap: 8, alignItems: "center" }}>
				<Text type="lg-medium" style={[t.atoms.text]} numberOfLines={1}>
					Following
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	empty: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderRadius: 8,
		marginHorizontal: 10,
		marginTop: 10,
	},
	title: {
		paddingHorizontal: 14,
		paddingTop: 20,
		paddingBottom: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	itemContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	footerText: {
		paddingHorizontal: 26,
		paddingVertical: 22,
	},
});
