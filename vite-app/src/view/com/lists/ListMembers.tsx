import type { AppBskyGraphDefs } from "@atproto/api";
import React, { type JSX, useCallback } from "react";

import { ListFooter } from "#/components/Lists";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { cleanError } from "#/lib/strings/errors";
import { useModalControls } from "#/state/modals";
import { useListMembersQuery } from "#/state/queries/list-members";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";
import { ProfileCard } from "../profile/ProfileCard";
import { List, type ListRef } from "../util/List";
import { LoadMoreRetryBtn } from "../util/LoadMoreRetryBtn";
import { ProfileCardFeedLoadingPlaceholder } from "../util/LoadingPlaceholder";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Button } from "../util/forms/Button";

const LOADING_ITEM = { _reactKey: "__loading__" };
const EMPTY_ITEM = { _reactKey: "__empty__" };
const ERROR_ITEM = { _reactKey: "__error__" };
const LOAD_MORE_ERROR_ITEM = { _reactKey: "__load_more_error__" };

export function ListMembers({
	list,
	style,
	scrollElRef,
	onScrolledDownChange,
	onPressTryAgain,
	renderHeader,
	renderEmptyState,
	headerOffset = 0,
	desktopFixedHeightOffset,
}: {
	list: string;
	style?: React.CSSProperties;
	scrollElRef?: ListRef;
	onScrolledDownChange: (isScrolledDown: boolean) => void;
	onPressTryAgain?: () => void;
	renderHeader: () => JSX.Element;
	renderEmptyState: () => JSX.Element;
	headerOffset?: number;
	desktopFixedHeightOffset?: number;
}) {
	const [isRefreshing, setIsRefreshing] = React.useState(false);
	const { isMobile } = useWebMediaQueries();
	const { openModal } = useModalControls();
	const { currentAccount } = useSession();

	const { data, isFetching, isFetched, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useListMembersQuery(list);
	const isEmpty = !isFetching && !data?.pages[0].items.length;
	const isOwner = currentAccount && data?.pages[0].list.creator.did === currentAccount.did;

	const items = React.useMemo(() => {
		let items: any[] = [];
		if (isFetched) {
			if (isEmpty && isError) {
				items = items.concat([ERROR_ITEM]);
			}
			if (isEmpty) {
				items = items.concat([EMPTY_ITEM]);
			} else if (data) {
				for (const page of data.pages) {
					items = items.concat(page.items);
				}
			}
			if (!isEmpty && isError) {
				items = items.concat([LOAD_MORE_ERROR_ITEM]);
			}
		} else if (isFetching) {
			items = items.concat([LOADING_ITEM]);
		}
		return items;
	}, [isFetched, isEmpty, isError, data, isFetching]);

	// events
	// =

	const onRefresh = React.useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh lists", { message: err });
		}
		setIsRefreshing(false);
	}, [refetch]);

	const onEndReached = React.useCallback(async () => {
		if (isFetching || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more lists", { message: err });
		}
	}, [isFetching, hasNextPage, isError, fetchNextPage]);

	const onPressRetryLoadMore = React.useCallback(() => {
		fetchNextPage();
	}, [fetchNextPage]);

	const onPressEditMembership = React.useCallback(
		(profile: bsky.profile.AnyProfileView) => {
			openModal({
				name: "user-add-remove-lists",
				subject: profile.did,
				displayName: profile.displayName || profile.handle,
				handle: profile.handle,
			});
		},
		[openModal],
	);

	// rendering
	// =

	const renderMemberButton = React.useCallback(
		(profile: bsky.profile.AnyProfileView) => {
			if (!isOwner) {
				return null;
			}
			return <Button type="default" label={"Edit"} onPress={() => onPressEditMembership(profile)} />;
		},
		[isOwner, onPressEditMembership],
	);

	const renderItem = React.useCallback(
		({ item }: { item: any }) => {
			if (item === EMPTY_ITEM) {
				return renderEmptyState();
			} else if (item === ERROR_ITEM) {
				return <ErrorMessage message={cleanError(error)} onPressTryAgain={onPressTryAgain} />;
			} else if (item === LOAD_MORE_ERROR_ITEM) {
				return (
					<LoadMoreRetryBtn
						label={"There was an issue fetching the list. Tap here to try again."}
						onPress={onPressRetryLoadMore}
					/>
				);
			} else if (item === LOADING_ITEM) {
				return <ProfileCardFeedLoadingPlaceholder />;
			}
			return (
				<ProfileCard
					profile={(item as AppBskyGraphDefs.ListItemView).subject}
					renderButton={renderMemberButton}
					style={{ padding: `4px ${isMobile ? 8 : 14}px` }}
					noModFilter
				/>
			);
		},
		[renderMemberButton, renderEmptyState, error, onPressTryAgain, onPressRetryLoadMore, isMobile],
	);

	const renderFooter = useCallback(() => {
		if (isEmpty) return null;
		return (
			<ListFooter
				hasNextPage={hasNextPage}
				error={cleanError(error)}
				isFetchingNextPage={isFetchingNextPage}
				onRetry={fetchNextPage}
			/>
		);
	}, [hasNextPage, error, isFetchingNextPage, fetchNextPage, isEmpty]);

	return (
		<div style={style}>
			<List
				ref={scrollElRef}
				data={items}
				keyExtractor={(item: any) => item.subject?.did || item._reactKey}
				renderItem={renderItem}
				ListHeaderComponent={!isEmpty ? renderHeader : undefined}
				ListFooterComponent={renderFooter}
				refreshing={isRefreshing}
				onRefresh={onRefresh}
				headerOffset={headerOffset}
				contentContainerStyle={{
					minHeight: window.innerHeight * 1.5,
				}}
				onScrolledDownChange={onScrolledDownChange}
				onEndReached={onEndReached}
				onEndReachedThreshold={0.6}
				removeClippedSubviews={true}
				desktopFixedHeight={desktopFixedHeightOffset || true}
			/>
		</div>
	);
}
