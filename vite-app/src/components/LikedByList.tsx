import type { AppBskyFeedGetLikes as GetLikes } from "@atproto/api";
import React from "react";

import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { cleanError } from "#/lib/strings/errors";
import { useLikedByQuery } from "#/state/queries/post-liked-by";
import { useResolveUriQuery } from "#/state/queries/resolve-uri";
import { ProfileCardWithFollowBtn } from "#/view/com/profile/ProfileCard";
import { List } from "#/view/com/util/List";

function renderItem({ item, index }: { item: GetLikes.Like; index: number }) {
	return <ProfileCardWithFollowBtn key={item.actor.did} profile={item.actor} noBorder={index === 0} />;
}

function keyExtractor(item: GetLikes.Like) {
	return item.actor.did;
}

export function LikedByList({ uri }: { uri: string }) {
	const initialNumToRender = useInitialNumToRender();
	const [isPTRing, setIsPTRing] = React.useState(false);

	const { data: resolvedUri, error: resolveError, isLoading: isUriLoading } = useResolveUriQuery(uri);
	const {
		data,
		isLoading: isLikedByLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error: likedByError,
		refetch,
	} = useLikedByQuery(resolvedUri?.uri);

	const error = resolveError || likedByError;
	const isError = !!resolveError || !!likedByError;

	const likes = React.useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.likes);
		}
		return [];
	}, [data]);

	const onRefresh = React.useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh likes", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = React.useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more likes", { message: err });
		}
	}, [isFetchingNextPage, hasNextPage, isError, fetchNextPage]);

	if (likes.length < 1) {
		return (
			<ListMaybePlaceholder
				isLoading={isUriLoading || isLikedByLoading}
				isError={isError}
				emptyType="results"
				emptyTitle={"No likes yet"}
				emptyMessage={"Nobody has liked this yet. Maybe you should be the first!"}
				errorMessage={cleanError(resolveError || error)}
				onRetry={isError ? refetch : undefined}
				topBorder={false}
				sideBorders={false}
			/>
		);
	}

	return (
		<List
			data={likes}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			refreshing={isPTRing}
			onRefresh={onRefresh}
			onEndReached={onEndReached}
			ListFooterComponent={
				<ListFooter isFetchingNextPage={isFetchingNextPage} error={cleanError(error)} onRetry={fetchNextPage} />
			}
			onEndReachedThreshold={3}
			initialNumToRender={initialNumToRender}
			// windowSize={11}
			sideBorders={false}
		/>
	);
}
