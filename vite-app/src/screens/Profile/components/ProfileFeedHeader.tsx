import { AtUri } from "@atproto/api";
import React from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import * as Layout from "#/components/Layout";
import { InlineLinkText } from "#/components/Link";
import * as Menu from "#/components/Menu";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { useRichText } from "#/components/hooks/useRichText";
import { ArrowOutOfBox_Stroke2_Corner0_Rounded as Share } from "#/components/icons/ArrowOutOfBox";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { DotGrid_Stroke2_Corner0_Rounded as Ellipsis } from "#/components/icons/DotGrid";
import {
	Heart2_Stroke2_Corner0_Rounded as Heart,
	Heart2_Filled_Stroke2_Corner0_Rounded as HeartFilled,
} from "#/components/icons/Heart2";
import { Pin_Stroke2_Corner0_Rounded as Pin, Pin_Filled_Corner0_Rounded as PinFilled } from "#/components/icons/Pin";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Trash_Stroke2_Corner0_Rounded as Trash } from "#/components/icons/Trash";
import { ReportDialog, useReportDialogControl } from "#/components/moderation/ReportDialog";
import { makeProfileLink } from "#/lib/routes/links";
import { makeCustomFeedLink } from "#/lib/routes/links";
import { shareUrl } from "#/lib/sharing";
import { sanitizeHandle } from "#/lib/strings/handles";
import { toShareUrl } from "#/lib/strings/url-helpers";
import type { FeedSourceFeedInfo } from "#/state/queries/feed";
import { useLikeMutation, useUnlikeMutation } from "#/state/queries/like";
import {
	useAddSavedFeedsMutation,
	usePreferencesQuery,
	useRemoveFeedMutation,
	useUpdateSavedFeedsMutation,
} from "#/state/queries/preferences";
import { useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { formatCount } from "#/view/com/util/numeric/format";

export function ProfileFeedHeaderSkeleton() {
	const t = useTheme();

	return (
		<Layout.Header.Outer>
			<Layout.Header.BackButton />
			<Layout.Header.Content>
				<div
					style={{
						...a.w_full,
						...a.rounded_sm,
						...t.atoms.bg_contrast_25,
						...{ height: 40 },
					}}
				/>
			</Layout.Header.Content>
			<Layout.Header.Slot>
				<div
					style={{
						...a.justify_center,
						...a.align_center,
						...a.rounded_full,
						...t.atoms.bg_contrast_25,

						...{
							height: 34,
							width: 34,
						},
					}}
				>
					<Pin size="lg" fill={t.atoms.text_contrast_low.color} />
				</div>
			</Layout.Header.Slot>
		</Layout.Header.Outer>
	);
}

export function ProfileFeedHeader({ info }: { info: FeedSourceFeedInfo }) {
	const t = useTheme();
	const { hasSession } = useSession();
	const { gtMobile } = useBreakpoints();
	const infoControl = Dialog.useDialogControl();

	const { data: preferences } = usePreferencesQuery();

	const [likeUri, setLikeUri] = React.useState(info.likeUri || "");
	const isLiked = !!likeUri;
	const likeCount = isLiked && likeUri ? (info.likeCount || 0) + 1 : info.likeCount || 0;

	const { mutateAsync: addSavedFeeds, isPending: isAddSavedFeedPending } = useAddSavedFeedsMutation();
	const { mutateAsync: removeFeed, isPending: isRemovePending } = useRemoveFeedMutation();
	const { mutateAsync: updateSavedFeeds, isPending: isUpdateFeedPending } = useUpdateSavedFeedsMutation();

	const isFeedStateChangePending = isAddSavedFeedPending || isRemovePending || isUpdateFeedPending;
	const savedFeedConfig = preferences?.savedFeeds?.find((f) => f.value === info.uri);
	const isSaved = Boolean(savedFeedConfig);
	const isPinned = Boolean(savedFeedConfig?.pinned);

	const onToggleSaved = React.useCallback(async () => {
		try {
			if (savedFeedConfig) {
				await removeFeed(savedFeedConfig);
				Toast.show("Removed from your feeds");
			} else {
				await addSavedFeeds([
					{
						type: "feed",
						value: info.uri,
						pinned: false,
					},
				]);
				Toast.show("Saved to your feeds");
			}
		} catch (err) {
			Toast.show(
				"There was an issue updating your feeds, please check your internet connection and try again.",
				"xmark",
			);
			console.error("Failed to update feeds", { message: err });
		}
	}, [info, removeFeed, addSavedFeeds, savedFeedConfig]);

	const onTogglePinned = React.useCallback(async () => {
		try {
			if (savedFeedConfig) {
				const pinned = !savedFeedConfig.pinned;
				await updateSavedFeeds([
					{
						...savedFeedConfig,
						pinned,
					},
				]);

				if (pinned) {
					Toast.show(`Pinned ${info.displayName} to Home`);
				} else {
					Toast.show(`Unpinned ${info.displayName} from Home`);
				}
			} else {
				await addSavedFeeds([
					{
						type: "feed",
						value: info.uri,
						pinned: true,
					},
				]);
				Toast.show(`Pinned ${info.displayName} to Home`);
			}
		} catch (e) {
			Toast.show("There was an issue contacting the server", "xmark");
			console.error("Failed to toggle pinned feed", { message: e });
		}
	}, [info, savedFeedConfig, updateSavedFeeds, addSavedFeeds]);

	return (
		<>
			<Layout.Center
				style={{
					...t.atoms.bg,
					...a.z_10,
					...a.sticky,
					...a.z_10,
					top: 0,
				}}
			>
				<Layout.Header.Outer>
					<Layout.Header.BackButton />
					<Layout.Header.Content align="left">
						<Button
							label={"Open feed info screen"}
							style={{
								...a.justify_start,

								...{
									paddingTop: 2,
									paddingBottom: 2,
									paddingRight: 8,
								},
							}}
							onPress={() => {
								infoControl.open();
							}}
						>
							{({ hovered, pressed }) => (
								<>
									<div
										style={{
											...a.absolute,
											...a.inset_0,
											...a.rounded_sm,
											...a.transition_all,
											...t.atoms.bg_contrast_25,
											opacity: 0,
											left: -2,
											right: 0,
											...(pressed && { opacity: 1 }),
											...(hovered && {
												opacity: 1,
												scale: "1.01 1.1",
											}),
										}}
									/>

									<div
										style={{
											...a.flex_1,
											...a.flex_row,
											...a.align_center,
											...a.gap_sm,
										}}
									>
										{info.avatar && <UserAvatar size={36} type="algo" avatar={info.avatar} />}

										<div style={a.flex_1}>
											<Text
												style={{
													...a.text_md,
													...a.font_heavy,
													...a.leading_tight,
													...(gtMobile && a.text_lg),
												}}
												numberOfLines={2}
											>
												{info.displayName}
											</Text>
											<div
												style={{
													...a.flex_row,
													...{ gap: 6 },
												}}
											>
												<Text
													style={{
														...a.flex_shrink,
														...a.text_sm,
														...a.leading_snug,
														...t.atoms.text_contrast_medium,
													}}
													numberOfLines={1}
												>
													{sanitizeHandle(info.creatorHandle, "@")}
												</Text>
												<div
													style={{
														...a.flex_row,
														...a.align_center,
														...{ gap: 2 },
													}}
												>
													<HeartFilled
														size="xs"
														fill={
															likeUri ? t.palette.like : t.atoms.text_contrast_low.color
														}
													/>
													<Text
														style={{
															...a.text_sm,
															...a.leading_snug,
															...t.atoms.text_contrast_medium,
														}}
														numberOfLines={1}
													>
														{formatCount(likeCount)}
													</Text>
												</div>
											</div>
										</div>

										<Ellipsis size="md" fill={t.atoms.text_contrast_low.color} />
									</div>
								</>
							)}
						</Button>
					</Layout.Header.Content>

					{hasSession && (
						<Layout.Header.Slot>
							{isPinned ? (
								<Menu.Root>
									<Menu.Trigger label={"Open feed options menu"}>
										{({ props }) => {
											return (
												<Button
													{...props}
													label={"Open feed options menu"}
													size="small"
													variant="ghost"
													shape="square"
													color="secondary"
												>
													<PinFilled size="lg" fill={t.palette.primary_500} />
												</Button>
											);
										}}
									</Menu.Trigger>

									<Menu.Outer>
										<Menu.Item
											disabled={isFeedStateChangePending}
											label={"Unpin from home"}
											onPress={onTogglePinned}
										>
											<Menu.ItemText>{"Unpin from home"}</Menu.ItemText>
											<Menu.ItemIcon icon={X} position="right" />
										</Menu.Item>
										<Menu.Item
											disabled={isFeedStateChangePending}
											label={isSaved ? "Remove from my feeds" : "Save to my feeds"}
											onPress={onToggleSaved}
										>
											<Menu.ItemText>
												{isSaved ? "Remove from my feeds" : "Save to my feeds"}
											</Menu.ItemText>
											<Menu.ItemIcon icon={isSaved ? Trash : Plus} position="right" />
										</Menu.Item>
									</Menu.Outer>
								</Menu.Root>
							) : (
								<Button
									label={"Pin to Home"}
									size="small"
									variant="ghost"
									shape="square"
									color="secondary"
									onPress={onTogglePinned}
								>
									<ButtonIcon icon={Pin} size="lg" />
								</Button>
							)}
						</Layout.Header.Slot>
					)}
				</Layout.Header.Outer>
			</Layout.Center>
			<Dialog.Outer control={infoControl}>
				<Dialog.Handle />
				<Dialog.ScrollableInner
					label={"Feed menu"}
					style={gtMobile ? { width: "auto", minWidth: 450 } : a.w_full}
				>
					<DialogInner
						info={info}
						likeUri={likeUri}
						setLikeUri={setLikeUri}
						likeCount={likeCount}
						isPinned={isPinned}
						onTogglePinned={onTogglePinned}
						isFeedStateChangePending={isFeedStateChangePending}
					/>
				</Dialog.ScrollableInner>
			</Dialog.Outer>
		</>
	);
}

function DialogInner({
	info,
	likeUri,
	setLikeUri,
	likeCount,
	isPinned,
	onTogglePinned,
	isFeedStateChangePending,
}: {
	info: FeedSourceFeedInfo;
	likeUri: string;
	setLikeUri: (uri: string) => void;
	likeCount: number;
	isPinned: boolean;
	onTogglePinned: () => void;
	isFeedStateChangePending: boolean;
}) {
	const t = useTheme();
	const { hasSession } = useSession();
	const control = Dialog.useDialogContext();
	const reportDialogControl = useReportDialogControl();
	const [rt] = useRichText(info.description.text);
	const { mutateAsync: likeFeed, isPending: isLikePending } = useLikeMutation();
	const { mutateAsync: unlikeFeed, isPending: isUnlikePending } = useUnlikeMutation();

	const isLiked = !!likeUri;
	const feedRkey = React.useMemo(() => new AtUri(info.uri).rkey, [info.uri]);

	const onToggleLiked = React.useCallback(async () => {
		try {
			if (isLiked && likeUri) {
				await unlikeFeed({ uri: likeUri });
				setLikeUri("");
			} else {
				const res = await likeFeed({ uri: info.uri, cid: info.cid });
				setLikeUri(res.uri);
			}
		} catch (err) {
			Toast.show(
				"There was an issue contacting the server, please check your internet connection and try again.",
				"xmark",
			);
			console.error("Failed to toggle like", { message: err });
		}
	}, [isLiked, likeUri, unlikeFeed, setLikeUri, likeFeed, info]);

	const onPressShare = React.useCallback(() => {
		const url = toShareUrl(info.route.href);
		shareUrl(url);
	}, [info]);

	const onPressReport = React.useCallback(() => {
		reportDialogControl.open();
	}, [reportDialogControl]);

	return (
		<div style={a.gap_md}>
			<div
				style={{
					...a.flex_row,
					...a.align_center,
					...a.gap_md,
				}}
			>
				<UserAvatar type="algo" size={48} avatar={info.avatar} />

				<div
					style={{
						...a.flex_1,
						...a.gap_2xs,
					}}
				>
					<Text
						style={{
							...a.text_2xl,
							...a.font_heavy,
							...a.leading_tight,
						}}
						numberOfLines={2}
					>
						{info.displayName}
					</Text>
					<Text
						style={{
							...a.text_sm,
							...a.leading_tight,
							...t.atoms.text_contrast_medium,
						}}
						numberOfLines={1}
					>
						<>
							By{" "}
							<InlineLinkText
								label={`View ${info.creatorHandle}'s profile`}
								to={makeProfileLink({
									did: info.creatorDid,
									handle: info.creatorHandle,
								})}
								style={{
									...a.text_sm,
									...a.leading_tight,
									...a.underline,
									...t.atoms.text_contrast_medium,
								}}
								// TODO
								// numberOfLines={1}
								onPress={() => control.close()}
							>
								{sanitizeHandle(info.creatorHandle, "@")}
							</InlineLinkText>
						</>
					</Text>
				</div>

				<Button
					label={"Share this feed"}
					size="small"
					variant="ghost"
					color="secondary"
					shape="round"
					onPress={onPressShare}
				>
					<ButtonIcon icon={Share} size="lg" />
				</Button>
			</div>
			<RichText
				value={rt}
				style={{
					...a.text_md,
					...a.leading_snug,
				}}
			/>
			<div
				style={{
					...a.flex_row,
					...a.gap_sm,
					...a.align_center,
				}}
			>
				{typeof likeCount === "number" && (
					<InlineLinkText
						label={"View users who like this feed"}
						to={makeCustomFeedLink(info.creatorDid, feedRkey, "liked-by")}
						style={{
							...a.underline,
							...t.atoms.text_contrast_medium,
						}}
						onPress={() => control.close()}
					>
						<>
							Liked by {likeCount ?? 0} {likeCount === 1 ? "user" : "users"}
						</>
					</InlineLinkText>
				)}
			</div>
			{hasSession && (
				<>
					<div
						style={{
							...a.flex_row,
							...a.gap_sm,
							...a.align_center,
							...a.pt_sm,
						}}
					>
						<Button
							disabled={isLikePending || isUnlikePending}
							label={"Like this feed"}
							size="small"
							variant="solid"
							color="secondary"
							onPress={onToggleLiked}
							style={a.flex_1}
						>
							{isLiked ? (
								<HeartFilled size="sm" fill={t.palette.like} />
							) : (
								<ButtonIcon icon={Heart} position="left" />
							)}

							<ButtonText>{isLiked ? <>Unlike</> : <>Like</>}</ButtonText>
						</Button>
						<Button
							disabled={isFeedStateChangePending}
							label={isPinned ? "Unpin feed" : "Pin feed"}
							size="small"
							variant="solid"
							color={isPinned ? "secondary" : "primary"}
							onPress={onTogglePinned}
							style={a.flex_1}
						>
							<ButtonText>{isPinned ? <>Unpin feed</> : <>Pin feed</>}</ButtonText>
							<ButtonIcon icon={Pin} position="right" />
						</Button>
					</div>

					<div
						style={{
							...a.pt_xs,
							...a.gap_lg,
						}}
					>
						<Divider />

						<div
							style={{
								...a.flex_row,
								...a.align_center,
								...a.gap_sm,
								...a.justify_between,
							}}
						>
							<Text
								style={{
									...a.italic,
									...t.atoms.text_contrast_medium,
								}}
							>
								Something wrong? Let us know.
							</Text>

							<Button
								label={"Report feed"}
								size="small"
								variant="solid"
								color="secondary"
								onPress={onPressReport}
							>
								<ButtonText>Report feed</ButtonText>
								<ButtonIcon icon={CircleInfo} position="right" />
							</Button>
						</div>

						{info.view && (
							<ReportDialog
								control={reportDialogControl}
								subject={{
									...info.view,
									$type: "app.bsky.feed.defs#generatorView",
								}}
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
