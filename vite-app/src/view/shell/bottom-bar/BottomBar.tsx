import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StackActions } from "@react-navigation/native";
import React, { type JSX, type ComponentProps } from "react";
import { type GestureResponderEvent, View } from "react-native";
import Animated from "react-native-reanimated";

import { atoms as a } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { SwitchAccountDialog } from "#/components/dialogs/SwitchAccount";
import {
	Bell_Stroke2_Corner0_Rounded as Bell,
	Bell_Filled_Corner0_Rounded as BellFilled,
} from "#/components/icons/Bell";
import {
	HomeOpen_Stoke2_Corner0_Rounded as Home,
	HomeOpen_Filled_Corner0_Rounded as HomeFilled,
} from "#/components/icons/HomeOpen";
import { MagnifyingGlass_Filled_Stroke2_Corner0_Rounded as MagnifyingGlassFilled } from "#/components/icons/MagnifyingGlass";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as MagnifyingGlass } from "#/components/icons/MagnifyingGlass2";
import {
	Message_Stroke2_Corner0_Rounded as Message,
	Message_Stroke2_Corner0_Rounded_Filled as MessageFilled,
} from "#/components/icons/Message";
import { PressableScale } from "#/lib/custom-animations/PressableScale";
import { useDedupe } from "#/lib/hooks/useDedupe";
import { useMinimalShellFooterTransform } from "#/lib/hooks/useMinimalShellTransform";
import { useNavigationTabState } from "#/lib/hooks/useNavigationTabState";
import { usePalette } from "#/lib/hooks/usePalette";
import { clamp } from "#/lib/numbers";
import { TabState, getTabState } from "#/lib/routes/helpers";
import { emitSoftReset } from "#/state/events";
import { useHomeBadge } from "#/state/home-badge";
import { useUnreadMessageCount } from "#/state/queries/messages/list-conversations";
import { useUnreadNotifications } from "#/state/queries/notifications/unread";
import { useProfileQuery } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useShellLayout } from "#/state/shell/shell-layout";
import { useCloseAllActiveElements } from "#/state/util";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { Text } from "#/view/com/util/text/Text";
import { Logo } from "#/view/icons/Logo";
import { Logotype } from "#/view/icons/Logotype";
import { styles } from "./BottomBarStyles";

type TabOptions = "Home" | "Search" | "Notifications" | "MyProfile" | "Feeds" | "Messages";

export function BottomBar({ navigation }: BottomTabBarProps) {
	const { hasSession, currentAccount } = useSession();
	const pal = usePalette("default");
	const { footerHeight } = useShellLayout();
	const { isAtHome, isAtSearch, isAtNotifications, isAtMyProfile, isAtMessages } = useNavigationTabState();
	const numUnreadNotifications = useUnreadNotifications();
	const numUnreadMessages = useUnreadMessageCount();
	const footerMinimalShellTransform = useMinimalShellFooterTransform();
	const { data: profile } = useProfileQuery({ did: currentAccount?.did });
	const { requestSwitchToAccount } = useLoggedOutViewControls();
	const closeAllActiveElements = useCloseAllActiveElements();
	const dedupe = useDedupe();
	const accountSwitchControl = useDialogControl();
	const hasHomeBadge = useHomeBadge();
	const iconWidth = 28;

	const showSignIn = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "none" });
	}, [requestSwitchToAccount, closeAllActiveElements]);

	const showCreateAccount = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "new" });
		// setShowLoggedOut(true)
	}, [requestSwitchToAccount, closeAllActiveElements]);

	const onPressTab = React.useCallback(
		(tab: TabOptions) => {
			const state = navigation.getState();
			const tabState = getTabState(state, tab);
			if (tabState === TabState.InsideAtRoot) {
				emitSoftReset();
			} else if (tabState === TabState.Inside) {
				dedupe(() => navigation.dispatch(StackActions.popToTop()));
			} else {
				dedupe(() => navigation.navigate(`${tab}Tab`));
			}
		},
		[navigation, dedupe],
	);
	const onPressHome = React.useCallback(() => onPressTab("Home"), [onPressTab]);
	const onPressSearch = React.useCallback(() => onPressTab("Search"), [onPressTab]);
	const onPressNotifications = React.useCallback(() => onPressTab("Notifications"), [onPressTab]);
	const onPressProfile = React.useCallback(() => {
		onPressTab("MyProfile");
	}, [onPressTab]);
	const onPressMessages = React.useCallback(() => {
		onPressTab("Messages");
	}, [onPressTab]);

	const onLongPressProfile = React.useCallback(() => {
		accountSwitchControl.open();
	}, [accountSwitchControl]);

	return (
		<>
			<SwitchAccountDialog control={accountSwitchControl} />

			<Animated.View
				style={[
					styles.bottomBar,
					pal.view,
					pal.border,
					{ paddingBottom: clamp(0, 15, 60) },
					footerMinimalShellTransform,
				]}
				onLayout={(e) => {
					footerHeight.set(e.nativeEvent.layout.height);
				}}
			>
				{hasSession ? (
					<>
						<Btn
							testID="bottomBarHomeBtn"
							icon={
								isAtHome ? (
									<HomeFilled
										width={iconWidth + 1}
										style={[styles.ctrlIcon, pal.text, styles.homeIcon]}
									/>
								) : (
									<Home width={iconWidth + 1} style={[styles.ctrlIcon, pal.text, styles.homeIcon]} />
								)
							}
							// hasNew={hasHomeBadge && gate("remove_show_latest_button")}
							onPress={onPressHome}
							accessibilityRole="tab"
							accessibilityLabel={"Home"}
							accessibilityHint=""
						/>
						<Btn
							icon={
								isAtSearch ? (
									<MagnifyingGlassFilled
										width={iconWidth + 2}
										style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
									/>
								) : (
									<MagnifyingGlass
										testID="bottomBarSearchBtn"
										width={iconWidth + 2}
										style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
									/>
								)
							}
							onPress={onPressSearch}
							accessibilityRole="search"
							accessibilityLabel={"Search"}
							accessibilityHint=""
						/>
						<Btn
							testID="bottomBarMessagesBtn"
							icon={
								isAtMessages ? (
									<MessageFilled
										width={iconWidth - 1}
										style={[styles.ctrlIcon, pal.text, styles.feedsIcon]}
									/>
								) : (
									<Message
										width={iconWidth - 1}
										style={[styles.ctrlIcon, pal.text, styles.feedsIcon]}
									/>
								)
							}
							onPress={onPressMessages}
							notificationCount={numUnreadMessages.numUnread}
							hasNew={numUnreadMessages.hasNew}
							accessible={true}
							accessibilityRole="tab"
							accessibilityLabel={"Chat"}
							accessibilityHint={
								numUnreadMessages.count > 0
									? `${numUnreadMessages.numUnread ?? 0} unread ${numUnreadMessages.numUnread === "1" ? "item" : "items"}`
									: ""
							}
						/>
						<Btn
							testID="bottomBarNotificationsBtn"
							icon={
								isAtNotifications ? (
									<BellFilled
										width={iconWidth}
										style={[styles.ctrlIcon, pal.text, styles.bellIcon]}
									/>
								) : (
									<Bell width={iconWidth} style={[styles.ctrlIcon, pal.text, styles.bellIcon]} />
								)
							}
							onPress={onPressNotifications}
							notificationCount={numUnreadNotifications}
							accessible={true}
							accessibilityRole="tab"
							accessibilityLabel={"Notifications"}
							accessibilityHint={
								numUnreadNotifications === ""
									? ""
									: `${numUnreadNotifications ?? 0} unread ${numUnreadNotifications === "1" ? "item" : "items"}`
							}
						/>
						<Btn
							testID="bottomBarProfileBtn"
							icon={
								<View style={styles.ctrlIconSizingWrapper}>
									{isAtMyProfile ? (
										<View
											style={[
												styles.ctrlIcon,
												pal.text,
												styles.profileIcon,
												styles.onProfile,
												{ borderColor: pal.text.color },
											]}
										>
											<UserAvatar
												avatar={profile?.avatar}
												size={iconWidth - 3}
												// See https://github.com/bluesky-social/social-app/pull/1801:
												usePlainRNImage={true}
												type={profile?.associated?.labeler ? "labeler" : "user"}
											/>
										</View>
									) : (
										<View style={[styles.ctrlIcon, pal.text, styles.profileIcon]}>
											<UserAvatar
												avatar={profile?.avatar}
												size={iconWidth - 3}
												// See https://github.com/bluesky-social/social-app/pull/1801:
												usePlainRNImage={true}
												type={profile?.associated?.labeler ? "labeler" : "user"}
											/>
										</View>
									)}
								</View>
							}
							onPress={onPressProfile}
							onLongPress={onLongPressProfile}
							accessibilityRole="tab"
							accessibilityLabel={"Profile"}
							accessibilityHint=""
						/>
					</>
				) : (
					<>
						<View
							style={{
								width: "100%",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								paddingTop: 14,
								paddingBottom: 2,
								paddingLeft: 14,
								paddingRight: 6,
								gap: 8,
							}}
						>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
								<Logo width={28} />
								<View style={{ paddingTop: 4 }}>
									<Logotype width={80} fill={pal.text.color} />
								</View>
							</View>

							<View style={[a.flex_row, a.flex_wrap, a.gap_sm]}>
								<Button
									onPress={showCreateAccount}
									label={"Create account"}
									size="small"
									variant="solid"
									color="primary"
								>
									<ButtonText>Create account</ButtonText>
								</Button>
								<Button
									onPress={showSignIn}
									label={"Sign in"}
									size="small"
									variant="solid"
									color="secondary"
								>
									<ButtonText>Sign in</ButtonText>
								</Button>
							</View>
						</View>
					</>
				)}
			</Animated.View>
		</>
	);
}

interface BtnProps
	extends Pick<
		ComponentProps<typeof PressableScale>,
		"accessible" | "accessibilityRole" | "accessibilityHint" | "accessibilityLabel"
	> {
	testID?: string;
	icon: JSX.Element;
	notificationCount?: string;
	hasNew?: boolean;
	onPress?: (event: GestureResponderEvent) => void;
	onLongPress?: (event: GestureResponderEvent) => void;
}

function Btn({
	testID,
	icon,
	hasNew,
	notificationCount,
	onPress,
	onLongPress,
	accessible,
	accessibilityHint,
	accessibilityLabel,
}: BtnProps) {
	return (
		<PressableScale
			testID={testID}
			style={[styles.ctrl, a.flex_1]}
			onPress={onPress}
			onLongPress={onLongPress}
			accessible={accessible}
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={accessibilityHint}
			targetScale={0.8}
		>
			{icon}
			{notificationCount ? (
				<View style={[styles.notificationCount, a.rounded_full]}>
					<Text style={styles.notificationCountLabel}>{notificationCount}</Text>
				</View>
			) : hasNew ? (
				<View style={[styles.hasNewBadge, a.rounded_full]} />
			) : null}
		</PressableScale>
	);
}
