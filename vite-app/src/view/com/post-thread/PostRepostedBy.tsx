import type { AppBskyActorDefs as ActorDefs } from "@atproto/api";
import { useCallback, useMemo, useState } from "react";

import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { cleanError } from "#/lib/strings/errors";
import { usePostRepostedByQuery } from "#/state/queries/post-reposted-by";
import { useResolveUriQuery } from "#/state/queries/resolve-uri";
import { ProfileCardWithFollowBtn } from "#/view/com/profile/ProfileCard";
import { List } from "#/view/com/util/List";

function renderItem({
	item,
	index,
}: {
	item: ActorDefs.ProfileView;
	index: number;
}) {
	return <ProfileCardWithFollowBtn key={item.did} profile={item} noBorder={index === 0} />;
}

function keyExtractor(item: ActorDefs.ProfileViewBasic) {
	return item.did;
}

export function PostRepostedBy({ uri }: { uri: string }) {
	const initialNumToRender = useInitialNumToRender();

	const [isPTRing, setIsPTRing] = useState(false);

	const { data: resolvedUri, error: resolveError, isLoading: isLoadingUri } = useResolveUriQuery(uri);
	const {
		data,
		isLoading: isLoadingRepostedBy,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
		refetch,
	} = usePostRepostedByQuery(resolvedUri?.uri);

	const isError = Boolean(resolveError || error);

	const repostedBy = useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.repostedBy);
		}
		return [];
	}, [data]);

	const onRefresh = useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh reposts", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more reposts", { message: err });
		}
	}, [isFetchingNextPage, hasNextPage, isError, fetchNextPage]);

	if (repostedBy.length < 1) {
		return (
			<ListMaybePlaceholder
				isLoading={isLoadingUri || isLoadingRepostedBy}
				isError={isError}
				emptyType="results"
				emptyTitle={"No reposts yet"}
				emptyMessage={"Nobody has reposted this yet. Maybe you should be the first!"}
				errorMessage={cleanError(resolveError || error)}
				sideBorders={false}
			/>
		);
	}

	// loaded
	// =
	return (
		<List
			data={repostedBy}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			refreshing={isPTRing}
			onRefresh={onRefresh}
			onEndReached={onEndReached}
			onEndReachedThreshold={4}
			ListFooterComponent={
				<ListFooter isFetchingNextPage={isFetchingNextPage} error={cleanError(error)} onRetry={fetchNextPage} />
			}
			desktopFixedHeight
			initialNumToRender={initialNumToRender}
			// windowSize={11}
			sideBorders={false}
		/>
	);
}
