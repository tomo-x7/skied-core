import { type BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
	CommonActions,
	DarkTheme,
	DefaultTheme,
	NavigationContainer,
	StackActions,
	createNavigationContainerRef,
} from "@react-navigation/native";
import * as React from "react";
import type { JSX } from "react/jsx-runtime";

import { useTheme } from "./alf";
import { timeout } from "./lib/async/timeout";
import { useColorSchemeStyle } from "./lib/hooks/useColorSchemeStyle";
import { useWebScrollRestoration } from "./lib/hooks/useWebScrollRestoration";
import { buildStateObject } from "./lib/routes/helpers";
import type {
	AllNavigatorParams,
	BottomTabNavigatorParams,
	FlatNavigatorParams,
	HomeTabNavigatorParams,
	MessagesTabNavigatorParams,
	MyProfileTabNavigatorParams,
	NotificationsTabNavigatorParams,
	SearchTabNavigatorParams,
} from "./lib/routes/types";
import type { RouteParams, State } from "./lib/routes/types";
import { attachRouteToLogEvents } from "./lib/statsig/statsig";
import { bskyTitle } from "./lib/strings/headings";
import { logger } from "./logger";
import { isNative } from "./platform/detection";
import { router } from "./routes";
import { SharedPreferencesTesterScreen } from "./screens/E2E/SharedPreferencesTesterScreen";
import HashtagScreen from "./screens/Hashtag";
import { MessagesScreen } from "./screens/Messages/ChatList";
import { MessagesConversationScreen } from "./screens/Messages/Conversation";
import { MessagesInboxScreen } from "./screens/Messages/Inbox";
import { MessagesSettingsScreen } from "./screens/Messages/Settings";
import { ModerationScreen } from "./screens/Moderation";
import { Screen as ModerationInteractionSettings } from "./screens/ModerationInteractionSettings";
import { PostLikedByScreen } from "./screens/Post/PostLikedBy";
import { PostQuotesScreen } from "./screens/Post/PostQuotes";
import { PostRepostedByScreen } from "./screens/Post/PostRepostedBy";
import { ProfileKnownFollowersScreen } from "./screens/Profile/KnownFollowers";
import { ProfileFeedScreen } from "./screens/Profile/ProfileFeed";
import { ProfileFollowersScreen } from "./screens/Profile/ProfileFollowers";
import { ProfileFollowsScreen } from "./screens/Profile/ProfileFollows";
import { ProfileLabelerLikedByScreen } from "./screens/Profile/ProfileLabelerLikedBy";
import { ProfileSearchScreen } from "./screens/Profile/ProfileSearch";
import { AboutSettingsScreen } from "./screens/Settings/AboutSettings";
import { AccessibilitySettingsScreen } from "./screens/Settings/AccessibilitySettings";
import { AccountSettingsScreen } from "./screens/Settings/AccountSettings";
import { AppIconSettingsScreen } from "./screens/Settings/AppIconSettings";
import { AppPasswordsScreen } from "./screens/Settings/AppPasswords";
import { AppearanceSettingsScreen } from "./screens/Settings/AppearanceSettings";
import { ContentAndMediaSettingsScreen } from "./screens/Settings/ContentAndMediaSettings";
import { ExternalMediaPreferencesScreen } from "./screens/Settings/ExternalMediaPreferences";
import { FollowingFeedPreferencesScreen } from "./screens/Settings/FollowingFeedPreferences";
import { LanguageSettingsScreen } from "./screens/Settings/LanguageSettings";
import { NotificationSettingsScreen } from "./screens/Settings/NotificationSettings";
import { PrivacyAndSecuritySettingsScreen } from "./screens/Settings/PrivacyAndSecuritySettings";
import { SettingsScreen } from "./screens/Settings/Settings";
import { ThreadPreferencesScreen } from "./screens/Settings/ThreadPreferences";
import { StarterPackScreen, StarterPackScreenShort } from "./screens/StarterPack/StarterPackScreen";
import { Wizard } from "./screens/StarterPack/Wizard";
import TopicScreen from "./screens/Topic";
import { VideoFeed } from "./screens/VideoFeed";
import { useModalControls } from "./state/modals";
import { useUnreadNotifications } from "./state/queries/notifications/unread";
import { useSession } from "./state/session";
import { shouldRequestEmailConfirmation, snoozeEmailConfirmationPrompt } from "./state/shell/reminders";
import { CommunityGuidelinesScreen } from "./view/screens/CommunityGuidelines";
import { CopyrightPolicyScreen } from "./view/screens/CopyrightPolicy";
import { DebugModScreen } from "./view/screens/DebugMod";
import { FeedsScreen } from "./view/screens/Feeds";
import { HomeScreen } from "./view/screens/Home";
import { ListsScreen } from "./view/screens/Lists";
import { LogScreen } from "./view/screens/Log";
import { ModerationBlockedAccounts } from "./view/screens/ModerationBlockedAccounts";
import { ModerationModlistsScreen } from "./view/screens/ModerationModlists";
import { ModerationMutedAccounts } from "./view/screens/ModerationMutedAccounts";
import { NotFoundScreen } from "./view/screens/NotFound";
import { NotificationsScreen } from "./view/screens/Notifications";
import { PostThreadScreen } from "./view/screens/PostThread";
import { PrivacyPolicyScreen } from "./view/screens/PrivacyPolicy";
import { ProfileScreen } from "./view/screens/Profile";
import { ProfileFeedLikedByScreen } from "./view/screens/ProfileFeedLikedBy";
import { ProfileListScreen } from "./view/screens/ProfileList";
import { SavedFeeds } from "./view/screens/SavedFeeds";
import { SearchScreen } from "./view/screens/Search";
import { Storybook } from "./view/screens/Storybook";
import { SupportScreen } from "./view/screens/Support";
import { TermsOfServiceScreen } from "./view/screens/TermsOfService";
import { BottomBar } from "./view/shell/bottom-bar/BottomBar";
import { createNativeStackNavigatorWithAuth } from "./view/shell/createNativeStackNavigatorWithAuth";

const navigationRef = createNavigationContainerRef<AllNavigatorParams>();

const HomeTab = createNativeStackNavigatorWithAuth<HomeTabNavigatorParams>();
const SearchTab = createNativeStackNavigatorWithAuth<SearchTabNavigatorParams>();
const NotificationsTab = createNativeStackNavigatorWithAuth<NotificationsTabNavigatorParams>();
const MyProfileTab = createNativeStackNavigatorWithAuth<MyProfileTabNavigatorParams>();
const MessagesTab = createNativeStackNavigatorWithAuth<MessagesTabNavigatorParams>();
const Flat = createNativeStackNavigatorWithAuth<FlatNavigatorParams>();
const Tab = createBottomTabNavigator<BottomTabNavigatorParams>();

/**
 * These "common screens" are reused across stacks.
 */
function commonScreens(Stack: typeof HomeTab, unreadCountLabel?: string) {
	const title = (page: string) => bskyTitle(page, unreadCountLabel);

	return (
		<>
			<Stack.Screen name="NotFound" getComponent={() => NotFoundScreen} options={{ title: title("Not Found") }} />
			<Stack.Screen name="Lists" component={ListsScreen} options={{ title: title("Lists"), requireAuth: true }} />
			<Stack.Screen
				name="Moderation"
				getComponent={() => ModerationScreen}
				options={{ title: title("Moderation"), requireAuth: true }}
			/>
			<Stack.Screen
				name="ModerationModlists"
				getComponent={() => ModerationModlistsScreen}
				options={{ title: title("Moderation Lists"), requireAuth: true }}
			/>
			<Stack.Screen
				name="ModerationMutedAccounts"
				getComponent={() => ModerationMutedAccounts}
				options={{ title: title("Muted Accounts"), requireAuth: true }}
			/>
			<Stack.Screen
				name="ModerationBlockedAccounts"
				getComponent={() => ModerationBlockedAccounts}
				options={{ title: title("Blocked Accounts"), requireAuth: true }}
			/>
			<Stack.Screen
				name="ModerationInteractionSettings"
				getComponent={() => ModerationInteractionSettings}
				options={{
					title: title("Post Interaction Settings"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="Settings"
				getComponent={() => SettingsScreen}
				options={{ title: title("Settings"), requireAuth: true }}
			/>
			<Stack.Screen
				name="LanguageSettings"
				getComponent={() => LanguageSettingsScreen}
				options={{ title: title("Language Settings"), requireAuth: true }}
			/>
			<Stack.Screen
				name="Profile"
				getComponent={() => ProfileScreen}
				options={({ route }) => ({
					title: bskyTitle(`@${route.params.name}`, unreadCountLabel),
				})}
			/>
			<Stack.Screen
				name="ProfileFollowers"
				getComponent={() => ProfileFollowersScreen}
				options={({ route }) => ({
					title: title("People following @${route.params.name}"),
				})}
			/>
			<Stack.Screen
				name="ProfileFollows"
				getComponent={() => ProfileFollowsScreen}
				options={({ route }) => ({
					title: title("People followed by @${route.params.name}"),
				})}
			/>
			<Stack.Screen
				name="ProfileKnownFollowers"
				getComponent={() => ProfileKnownFollowersScreen}
				options={({ route }) => ({
					title: title("Followers of @${route.params.name} that you know"),
				})}
			/>
			<Stack.Screen
				name="ProfileList"
				getComponent={() => ProfileListScreen}
				options={{ title: title("List"), requireAuth: true }}
			/>
			<Stack.Screen
				name="ProfileSearch"
				getComponent={() => ProfileSearchScreen}
				options={({ route }) => ({
					title: title("Search @${route.params.name}'s posts"),
				})}
			/>
			<Stack.Screen
				name="PostThread"
				getComponent={() => PostThreadScreen}
				options={({ route }) => ({
					title: title("Post by @${route.params.name}"),
				})}
			/>
			<Stack.Screen
				name="PostLikedBy"
				getComponent={() => PostLikedByScreen}
				options={({ route }) => ({
					title: title("Post by @${route.params.name}"),
				})}
			/>
			<Stack.Screen
				name="PostRepostedBy"
				getComponent={() => PostRepostedByScreen}
				options={({ route }) => ({
					title: title("Post by @${route.params.name}"),
				})}
			/>
			<Stack.Screen
				name="PostQuotes"
				getComponent={() => PostQuotesScreen}
				options={({ route }) => ({
					title: title("Post by @${route.params.name}"),
				})}
			/>
			<Stack.Screen
				name="ProfileFeed"
				getComponent={() => ProfileFeedScreen}
				options={{ title: title("Feed") }}
			/>
			<Stack.Screen
				name="ProfileFeedLikedBy"
				getComponent={() => ProfileFeedLikedByScreen}
				options={{ title: title("Liked by") }}
			/>
			<Stack.Screen
				name="ProfileLabelerLikedBy"
				getComponent={() => ProfileLabelerLikedByScreen}
				options={{ title: title("Liked by") }}
			/>
			<Stack.Screen
				name="Debug"
				getComponent={() => Storybook}
				options={{ title: title("Storybook"), requireAuth: true }}
			/>
			<Stack.Screen
				name="DebugMod"
				getComponent={() => DebugModScreen}
				options={{ title: title("Moderation states"), requireAuth: true }}
			/>
			<Stack.Screen
				name="SharedPreferencesTester"
				getComponent={() => SharedPreferencesTesterScreen}
				options={{ title: title("Shared Preferences Tester") }}
			/>
			<Stack.Screen
				name="Log"
				getComponent={() => LogScreen}
				options={{ title: title("Log"), requireAuth: true }}
			/>
			<Stack.Screen name="Support" getComponent={() => SupportScreen} options={{ title: title("Support") }} />
			<Stack.Screen
				name="PrivacyPolicy"
				getComponent={() => PrivacyPolicyScreen}
				options={{ title: title("Privacy Policy") }}
			/>
			<Stack.Screen
				name="TermsOfService"
				getComponent={() => TermsOfServiceScreen}
				options={{ title: title("Terms of Service") }}
			/>
			<Stack.Screen
				name="CommunityGuidelines"
				getComponent={() => CommunityGuidelinesScreen}
				options={{ title: title("Community Guidelines") }}
			/>
			<Stack.Screen
				name="CopyrightPolicy"
				getComponent={() => CopyrightPolicyScreen}
				options={{ title: title("Copyright Policy") }}
			/>
			<Stack.Screen
				name="AppPasswords"
				getComponent={() => AppPasswordsScreen}
				options={{ title: title("App Passwords"), requireAuth: true }}
			/>
			<Stack.Screen
				name="SavedFeeds"
				getComponent={() => SavedFeeds}
				options={{ title: title("Edit My Feeds"), requireAuth: true }}
			/>
			<Stack.Screen
				name="PreferencesFollowingFeed"
				getComponent={() => FollowingFeedPreferencesScreen}
				options={{
					title: title("Following Feed Preferences"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="PreferencesThreads"
				getComponent={() => ThreadPreferencesScreen}
				options={{ title: title("Threads Preferences"), requireAuth: true }}
			/>
			<Stack.Screen
				name="PreferencesExternalEmbeds"
				getComponent={() => ExternalMediaPreferencesScreen}
				options={{
					title: title("External Media Preferences"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="AccessibilitySettings"
				getComponent={() => AccessibilitySettingsScreen}
				options={{
					title: title("Accessibility Settings"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="AppearanceSettings"
				getComponent={() => AppearanceSettingsScreen}
				options={{
					title: title("Appearance"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="AccountSettings"
				getComponent={() => AccountSettingsScreen}
				options={{
					title: title("Account"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="PrivacyAndSecuritySettings"
				getComponent={() => PrivacyAndSecuritySettingsScreen}
				options={{
					title: title("Privacy and Security"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="ContentAndMediaSettings"
				getComponent={() => ContentAndMediaSettingsScreen}
				options={{
					title: title("Content and Media"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="AboutSettings"
				getComponent={() => AboutSettingsScreen}
				options={{
					title: title("About"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen
				name="AppIconSettings"
				getComponent={() => AppIconSettingsScreen}
				options={{
					title: title("App Icon"),
					requireAuth: true,
				}}
			/>
			<Stack.Screen name="Hashtag" getComponent={() => HashtagScreen} options={{ title: title("Hashtag") }} />
			<Stack.Screen name="Topic" getComponent={() => TopicScreen} options={{ title: title("Topic") }} />
			<Stack.Screen
				name="MessagesConversation"
				getComponent={() => MessagesConversationScreen}
				options={{ title: title("Chat"), requireAuth: true }}
			/>
			<Stack.Screen
				name="MessagesSettings"
				getComponent={() => MessagesSettingsScreen}
				options={{ title: title("Chat settings"), requireAuth: true }}
			/>
			<Stack.Screen
				name="MessagesInbox"
				getComponent={() => MessagesInboxScreen}
				options={{ title: title("Chat request inbox"), requireAuth: true }}
			/>
			<Stack.Screen
				name="NotificationSettings"
				getComponent={() => NotificationSettingsScreen}
				options={{ title: title("Notification settings"), requireAuth: true }}
			/>
			<Stack.Screen name="Feeds" getComponent={() => FeedsScreen} options={{ title: title("Feeds") }} />
			<Stack.Screen
				name="StarterPack"
				getComponent={() => StarterPackScreen}
				options={{ title: title("Starter Pack") }}
			/>
			<Stack.Screen
				name="StarterPackShort"
				getComponent={() => StarterPackScreenShort}
				options={{ title: title("Starter Pack") }}
			/>
			<Stack.Screen
				name="StarterPackWizard"
				getComponent={() => Wizard}
				options={{ title: title("Create a starter pack"), requireAuth: true }}
			/>
			<Stack.Screen
				name="StarterPackEdit"
				getComponent={() => Wizard}
				options={{ title: title("Edit your starter pack"), requireAuth: true }}
			/>
			<Stack.Screen
				name="VideoFeed"
				getComponent={() => VideoFeed}
				options={{
					title: title("Video Feed"),
					requireAuth: true,
				}}
			/>
		</>
	);
}

/**
 * The TabsNavigator is used by native mobile to represent the routes
 * in 3 distinct tab-stacks with a different root screen on each.
 */
function TabsNavigator() {
	const tabBar = React.useCallback(
		(props: JSX.IntrinsicAttributes & BottomTabBarProps) => <BottomBar {...props} />,
		[],
	);

	return (
		<Tab.Navigator
			initialRouteName="HomeTab"
			backBehavior="initialRoute"
			screenOptions={{ headerShown: false, lazy: true }}
			tabBar={tabBar}
		>
			<Tab.Screen name="HomeTab" getComponent={() => HomeTabNavigator} />
			<Tab.Screen name="SearchTab" getComponent={() => SearchTabNavigator} />
			<Tab.Screen name="NotificationsTab" getComponent={() => NotificationsTabNavigator} />
			<Tab.Screen name="MyProfileTab" getComponent={() => MyProfileTabNavigator} />
			<Tab.Screen name="MessagesTab" getComponent={() => MessagesTabNavigator} />
		</Tab.Navigator>
	);
}

function HomeTabNavigator() {
	const t = useTheme();

	return (
		<HomeTab.Navigator
			screenOptions={{
				animationDuration: 285,
				gestureEnabled: true,
				fullScreenGestureEnabled: true,
				headerShown: false,
				contentStyle: t.atoms.bg,
			}}
		>
			<HomeTab.Screen name="Home" getComponent={() => HomeScreen} />
			<HomeTab.Screen name="Start" getComponent={() => HomeScreen} />
			{commonScreens(HomeTab)}
		</HomeTab.Navigator>
	);
}

function SearchTabNavigator() {
	const t = useTheme();
	return (
		<SearchTab.Navigator
			screenOptions={{
				animationDuration: 285,
				gestureEnabled: true,
				fullScreenGestureEnabled: true,
				headerShown: false,
				contentStyle: t.atoms.bg,
			}}
		>
			<SearchTab.Screen name="Search" getComponent={() => SearchScreen} />
			{commonScreens(SearchTab as typeof HomeTab)}
		</SearchTab.Navigator>
	);
}

function NotificationsTabNavigator() {
	const t = useTheme();
	return (
		<NotificationsTab.Navigator
			screenOptions={{
				animationDuration: 285,
				gestureEnabled: true,
				fullScreenGestureEnabled: true,
				headerShown: false,
				contentStyle: t.atoms.bg,
			}}
		>
			<NotificationsTab.Screen
				name="Notifications"
				getComponent={() => NotificationsScreen}
				options={{ requireAuth: true }}
			/>
			{commonScreens(NotificationsTab as typeof HomeTab)}
		</NotificationsTab.Navigator>
	);
}

function MyProfileTabNavigator() {
	const t = useTheme();
	return (
		<MyProfileTab.Navigator
			screenOptions={{
				animationDuration: 285,
				gestureEnabled: true,
				fullScreenGestureEnabled: true,
				headerShown: false,
				contentStyle: t.atoms.bg,
			}}
		>
			<MyProfileTab.Screen
				// @ts-ignore // TODO: fix this broken type in ProfileScreen
				name="MyProfile"
				getComponent={() => ProfileScreen}
				initialParams={{
					name: "me",
					hideBackButton: true,
				}}
			/>
			{commonScreens(MyProfileTab as typeof HomeTab)}
		</MyProfileTab.Navigator>
	);
}

function MessagesTabNavigator() {
	const t = useTheme();
	return (
		<MessagesTab.Navigator
			screenOptions={{
				animationDuration: 285,
				gestureEnabled: true,
				fullScreenGestureEnabled: true,
				headerShown: false,
				contentStyle: t.atoms.bg,
			}}
		>
			<MessagesTab.Screen
				name="Messages"
				getComponent={() => MessagesScreen}
				options={({ route }) => ({
					requireAuth: true,
					animationTypeForReplace: route.params?.animation ?? "push",
				})}
			/>
			{commonScreens(MessagesTab as typeof HomeTab)}
		</MessagesTab.Navigator>
	);
}

/**
 * The FlatNavigator is used by Web to represent the routes
 * in a single ("flat") stack.
 */
const FlatNavigator = () => {
	const t = useTheme();
	const numUnread = useUnreadNotifications();
	const screenListeners = useWebScrollRestoration();
	const title = (page: string) => bskyTitle(page, numUnread);

	return (
		<Flat.Navigator
			screenListeners={screenListeners}
			screenOptions={{
				animationDuration: 285,
				gestureEnabled: true,
				fullScreenGestureEnabled: true,
				headerShown: false,
				contentStyle: t.atoms.bg,
			}}
		>
			<Flat.Screen name="Home" getComponent={() => HomeScreen} options={{ title: title("Home") }} />
			<Flat.Screen name="Search" getComponent={() => SearchScreen} options={{ title: title("Search") }} />
			<Flat.Screen
				name="Notifications"
				getComponent={() => NotificationsScreen}
				options={{ title: title("Notifications"), requireAuth: true }}
			/>
			<Flat.Screen
				name="Messages"
				getComponent={() => MessagesScreen}
				options={{ title: title("Messages"), requireAuth: true }}
			/>
			<Flat.Screen name="Start" getComponent={() => HomeScreen} options={{ title: title("Home") }} />
			{commonScreens(Flat as typeof HomeTab, numUnread)}
		</Flat.Navigator>
	);
};

/**
 * The RoutesContainer should wrap all components which need access
 * to the navigation context.
 */

const LINKING = {
	// TODO figure out what we are going to use
	prefixes: ["bsky://", "bluesky://", "https://bsky.app"],

	getPathFromState(state: State) {
		// find the current node in the navigation tree
		let node = state.routes[state.index || 0];
		while (node.state?.routes && typeof node.state?.index === "number") {
			node = node.state?.routes[node.state?.index];
		}

		// build the path
		const route = router.matchName(node.name);
		if (typeof route === "undefined") {
			return "/"; // default to home
		}
		return route.build((node.params || {}) as RouteParams);
	},

	getStateFromPath(path: string) {
		const [name, params] = router.matchPath(path);

		// Any time we receive a url that starts with `intent/` we want to ignore it here. It will be handled in the
		// intent handler hook. We should check for the trailing slash, because if there isn't one then it isn't a valid
		// intent
		// On web, there is no route state that's created by default, so we should initialize it as the home route. On
		// native, since the home tab and the home screen are defined as initial routes, we don't need to return a state
		// since it will be created by react-navigation.
		if (path.includes("intent/")) {
			if (isNative) return;
			return buildStateObject("Flat", "Home", params);
		}

		if (isNative) {
			if (name === "Search") {
				return buildStateObject("SearchTab", "Search", params);
			}
			if (name === "Notifications") {
				return buildStateObject("NotificationsTab", "Notifications", params);
			}
			if (name === "Home") {
				return buildStateObject("HomeTab", "Home", params);
			}
			if (name === "Messages") {
				return buildStateObject("MessagesTab", "Messages", params);
			}
			// if the path is something else, like a post, profile, or even settings, we need to initialize the home tab as pre-existing state otherwise the back button will not work
			return buildStateObject("HomeTab", name, params, [
				{
					name: "Home",
					params: {},
				},
			]);
		} else {
			const res = buildStateObject("Flat", name, params);
			return res;
		}
	},
};

function RoutesContainer({ children }: React.PropsWithChildren) {
	const theme = useColorSchemeStyle(DefaultTheme, DarkTheme);
	const { currentAccount } = useSession();
	const { openModal } = useModalControls();
	const prevLoggedRouteName = React.useRef<string | undefined>(undefined);

	function onReady() {
		prevLoggedRouteName.current = getCurrentRouteName();
		if (currentAccount && shouldRequestEmailConfirmation(currentAccount)) {
			openModal({ name: "verify-email", showReminder: true });
			snoozeEmailConfirmationPrompt();
		}
	}

	return (
		<NavigationContainer
			ref={navigationRef}
			linking={LINKING}
			theme={theme}
			onStateChange={() => {
				logger.metric("router:navigate", {
					from: prevLoggedRouteName.current,
				});
				prevLoggedRouteName.current = getCurrentRouteName();
			}}
			onReady={() => {
				attachRouteToLogEvents(getCurrentRouteName);
				logModuleInitTime();
				onReady();
				logger.metric("router:navigate", {});
			}}
		>
			{children}
		</NavigationContainer>
	);
}

function getCurrentRouteName() {
	if (navigationRef.isReady()) {
		return navigationRef.getCurrentRoute()?.name;
	} else {
		return undefined;
	}
}

/**
 * These helpers can be used from outside of the RoutesContainer
 * (eg in the state models).
 */

function navigate<K extends keyof AllNavigatorParams>(name: K, params?: AllNavigatorParams[K]) {
	if (navigationRef.isReady()) {
		return Promise.race([
			new Promise<void>((resolve) => {
				const handler = () => {
					resolve();
					navigationRef.removeListener("state", handler);
				};
				navigationRef.addListener("state", handler);

				// @ts-ignore I dont know what would make typescript happy but I have a life -prf
				navigationRef.navigate(name, params);
			}),
			timeout(1e3),
		]);
	}
	return Promise.resolve();
}

function resetToTab(tabName: "HomeTab" | "SearchTab" | "NotificationsTab") {
	if (navigationRef.isReady()) {
		navigate(tabName);
		if (navigationRef.canGoBack()) {
			navigationRef.dispatch(StackActions.popToTop()); //we need to check .canGoBack() before calling it
		}
	}
}

// returns a promise that resolves after the state reset is complete
function reset(): Promise<void> {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: isNative ? "HomeTab" : "Home" }],
			}),
		);
		return Promise.race([
			timeout(1e3),
			new Promise<void>((resolve) => {
				const handler = () => {
					resolve();
					navigationRef.removeListener("state", handler);
				};
				navigationRef.addListener("state", handler);
			}),
		]);
	} else {
		return Promise.resolve();
	}
}

function handleLink(url: string) {
	let path: string;
	if (url.startsWith("/")) {
		path = url;
	} else if (url.startsWith("http")) {
		try {
			path = new URL(url).pathname;
		} catch (e) {
			console.error("Invalid url", url, e);
			return;
		}
	} else {
		console.error("Invalid url", url);
		return;
	}

	const [name, params] = router.matchPath(path);
	if (isNative) {
		if (name === "Search") {
			resetToTab("SearchTab");
		} else if (name === "Notifications") {
			resetToTab("NotificationsTab");
		} else {
			resetToTab("HomeTab");
			// @ts-ignore matchPath doesnt give us type-checked output -prf
			navigate(name, params);
		}
	} else {
		// @ts-ignore matchPath doesnt give us type-checked output -prf
		navigate(name, params);
	}
}

//ログ絡み、エラー消すの面倒なのでとりあえず無効化
// let didInit = false
function logModuleInitTime() {
	// if (didInit) {
	//   return
	// }
	// didInit = true
	// const initMs = Math.round(
	//   // @ts-ignore Emitted by Metro in the bundle prelude
	//   performance.now() - global.__BUNDLE_START_TIME__,
	// )
	// console.log(`Time to first paint: ${initMs} ms`)
	// logEvent('init', {
	//   initMs,
	// })
	// if (isWeb) {
	//   const referrerInfo = Referrer.getReferrerInfo()
	//   if (referrerInfo && referrerInfo.hostname !== 'bsky.app') {
	//     logEvent('deepLink:referrerReceived', {
	//       to: window.location.href,
	//       referrer: referrerInfo?.referrer,
	//       hostname: referrerInfo?.hostname,
	//     })
	//   }
	// }
	// if (__DEV__) {
	//   // This log is noisy, so keep false committed
	//   const shouldLog = false
	//   // Relies on our patch to polyfill.js in metro-runtime
	//   const initLogs = (global as any).__INIT_LOGS__
	//   if (shouldLog && Array.isArray(initLogs)) {
	//     console.log(initLogs.join('\n'))
	//   }
	// }
}

export { FlatNavigator, handleLink, navigate, reset, resetToTab, RoutesContainer, TabsNavigator };
