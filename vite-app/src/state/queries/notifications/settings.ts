import { useMutation, useQueryClient } from "@tanstack/react-query";

import { until } from "#/lib/async/until";
import { RQKEY as RQKEY_NOTIFS } from "#/state/queries/notifications/feed";
import { invalidateCachedUnreadPage } from "#/state/queries/notifications/unread";
import { useAgent } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";

export function useNotificationSettingsMutation() {
	const agent = useAgent();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (keys: string[]) => {
			const enabled = keys[0] === "enabled";

			await agent.api.app.bsky.notification.putPreferences({
				priority: enabled,
			});

			await until(
				5, // 5 tries
				1e3, // 1s delay between tries
				(res) => res.data.priority === enabled,
				() => agent.api.app.bsky.notification.listNotifications({ limit: 1 }),
			);

			eagerlySetCachedPriority(queryClient, enabled);
		},
		onError: (err) => {
			console.error("Failed to save notification preferences", {
				safeMessage: err,
			});
			Toast.show("Failed to save notification preferences, please try again", "xmark");
		},
		onSuccess: () => {
			Toast.show("Preference saved");
		},
		onSettled: () => {
			invalidateCachedUnreadPage();
			queryClient.invalidateQueries({ queryKey: RQKEY_NOTIFS("all") });
			queryClient.invalidateQueries({ queryKey: RQKEY_NOTIFS("mentions") });
		},
	});
}

function eagerlySetCachedPriority(queryClient: ReturnType<typeof useQueryClient>, enabled: boolean) {
	function updateData(old: any) {
		if (!old) return old;
		return {
			...old,
			pages: old.pages.map((page: any) => {
				return {
					...page,
					priority: enabled,
				};
			}),
		};
	}
	queryClient.setQueryData(RQKEY_NOTIFS("all"), updateData);
	queryClient.setQueryData(RQKEY_NOTIFS("mentions"), updateData);
}
