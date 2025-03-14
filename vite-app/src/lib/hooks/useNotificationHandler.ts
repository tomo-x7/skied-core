import { CommonActions, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import React from "react";

import { resetToTab } from "#/Navigation";
import { useAccountSwitcher } from "#/lib/hooks/useAccountSwitcher";
import type { NavigationProp } from "#/lib/routes/types";
import { useCurrentConvoId } from "#/state/messages/current-convo-id";
import { RQKEY as RQKEY_NOTIFS } from "#/state/queries/notifications/feed";
import { invalidateCachedUnreadPage } from "#/state/queries/notifications/unread";
import { truncateAndInvalidate } from "#/state/queries/util";
import { useSession } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useCloseAllActiveElements } from "#/state/util";

type NotificationReason =
	| "like"
	| "repost"
	| "follow"
	| "mention"
	| "reply"
	| "quote"
	| "chat-message"
	| "starterpack-joined";

type NotificationPayload =
	| {
			reason: Exclude<NotificationReason, "chat-message">;
			uri: string;
			subject: string;
	  }
	| {
			reason: "chat-message";
			convoId: string;
			messageId: string;
			recipientDid: string;
	  };

const DEFAULT_HANDLER_OPTIONS = {
	shouldShowAlert: false,
	shouldPlaySound: false,
	shouldSetBadge: true,
};

// These need to stay outside the hook to persist between account switches
let storedPayload: NotificationPayload | undefined;
let prevDate = 0;

export function useNotificationsHandler() {
	const queryClient = useQueryClient();
	const { currentAccount, accounts } = useSession();
	const { onPressSwitchAccount } = useAccountSwitcher();
	const navigation = useNavigation<NavigationProp>();
	const { currentConvoId } = useCurrentConvoId();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const closeAllActiveElements = useCloseAllActiveElements();

	React.useEffect(() => {
		const handleNotification = (payload?: NotificationPayload) => {
			if (!payload) return;

			if (payload.reason === "chat-message") {
				if (payload.recipientDid !== currentAccount?.did && !storedPayload) {
					storedPayload = payload;
					closeAllActiveElements();

					const account = accounts.find((a) => a.did === payload.recipientDid);
					if (account) {
						onPressSwitchAccount(account);
					} else {
						setShowLoggedOut(true);
					}
				} else {
					//@ts-ignore
					navigation.dispatch((state) => {
						if (state.routes[0].name === "Messages") {
							if (state.routes[state.routes.length - 1].name === "MessagesConversation") {
								return CommonActions.reset({
									...state,
									routes: [
										...state.routes.slice(0, state.routes.length - 1),
										{
											name: "MessagesConversation",
											params: {
												conversation: payload.convoId,
											},
										},
									],
								});
							} else {
								return CommonActions.navigate("MessagesConversation", {
									conversation: payload.convoId,
								});
							}
						} else {
							return CommonActions.navigate("MessagesTab", {
								screen: "Messages",
								params: {
									pushToConversation: payload.convoId,
								},
							});
						}
					});
				}
			} else {
				switch (payload.reason) {
					case "like":
					case "repost":
					case "follow":
					case "mention":
					case "quote":
					case "reply":
					case "starterpack-joined":
						resetToTab("NotificationsTab");
						break;
					// TODO implement these after we have an idea of how to handle each individual case
					// case 'follow':
					//   const uri = new AtUri(payload.uri)
					//   setTimeout(() => {
					//     // @ts-expect-error types are weird here
					//     navigation.navigate('HomeTab', {
					//       screen: 'Profile',
					//       params: {
					//         name: uri.host,
					//       },
					//     })
					//   }, 500)
					//   break
					// case 'mention':
					// case 'reply':
					//   const urip = new AtUri(payload.uri)
					//   setTimeout(() => {
					//     // @ts-expect-error types are weird here
					//     navigation.navigate('HomeTab', {
					//       screen: 'PostThread',
					//       params: {
					//         name: urip.host,
					//         rkey: urip.rkey,
					//       },
					//     })
					//   }, 500)
				}
			}
		};

		Notifications.setNotificationHandler({
			//@ts-ignore
			handleNotification: async (e) => {
				if (
					e.request.trigger == null ||
					typeof e.request.trigger !== "object" ||
					!("type" in e.request.trigger) ||
					e.request.trigger.type !== "push"
				) {
					return DEFAULT_HANDLER_OPTIONS;
				}

				const payload = e.request.trigger.payload as NotificationPayload;
				if (payload.reason === "chat-message" && payload.recipientDid === currentAccount?.did) {
					return {
						shouldShowAlert: payload.convoId !== currentConvoId,
						shouldPlaySound: false,
						shouldSetBadge: false,
					};
				}

				// Any notification other than a chat message should invalidate the unread page
				invalidateCachedUnreadPage();
				return DEFAULT_HANDLER_OPTIONS;
			},
		});
		//@ts-ignore
		const responseReceivedListener = Notifications.addNotificationResponseReceivedListener((e) => {
			if (e.notification.date === prevDate) {
				return;
			}
			prevDate = e.notification.date;

			if (
				e.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER &&
				e.notification.request.trigger != null &&
				typeof e.notification.request.trigger === "object" &&
				"type" in e.notification.request.trigger &&
				e.notification.request.trigger.type === "push"
			) {
				invalidateCachedUnreadPage();
				const payload = e.notification.request.trigger.payload as NotificationPayload;
				truncateAndInvalidate(queryClient, RQKEY_NOTIFS("all"));
				if (payload.reason === "mention" || payload.reason === "quote" || payload.reason === "reply") {
					truncateAndInvalidate(queryClient, RQKEY_NOTIFS("mentions"));
				}
				handleNotification(payload);
				Notifications.dismissAllNotificationsAsync();
			}
		});

		// Whenever there's a stored payload, that means we had to switch accounts before handling the notification.
		// Whenever currentAccount changes, we should try to handle it again.
		if (storedPayload?.reason === "chat-message" && currentAccount?.did === storedPayload.recipientDid) {
			handleNotification(storedPayload);
			storedPayload = undefined;
		}

		return () => {
			responseReceivedListener.remove();
		};
	}, [
		queryClient,
		currentAccount,
		currentConvoId,
		accounts,
		closeAllActiveElements,
		currentAccount?.did,
		navigation,
		onPressSwitchAccount,
		setShowLoggedOut,
	]);
}
