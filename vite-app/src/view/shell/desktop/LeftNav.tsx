import type { AppBskyActorDefs } from "@atproto/api";
import React, { type JSX } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { atoms as a, flatten, tokens, useLayoutBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import type { DialogControlProps } from "#/components/Dialog";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { ArrowBoxLeft_Stroke2_Corner0_Rounded as LeaveIcon } from "#/components/icons/ArrowBoxLeft";
import {
	Bell_Stroke2_Corner0_Rounded as Bell,
	Bell_Filled_Corner0_Rounded as BellFilled,
} from "#/components/icons/Bell";
import {
	BulletList_Stroke2_Corner0_Rounded as List,
	BulletList_Filled_Corner0_Rounded as ListFilled,
} from "#/components/icons/BulletList";
import { DotGrid_Stroke2_Corner0_Rounded as EllipsisIcon } from "#/components/icons/DotGrid";
import { EditBig_Stroke2_Corner0_Rounded as EditBig } from "#/components/icons/EditBig";
import {
	Hashtag_Stroke2_Corner0_Rounded as Hashtag,
	Hashtag_Filled_Corner0_Rounded as HashtagFilled,
} from "#/components/icons/Hashtag";
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
import { PlusLarge_Stroke2_Corner0_Rounded as PlusIcon } from "#/components/icons/Plus";
import {
	SettingsGear2_Stroke2_Corner0_Rounded as Settings,
	SettingsGear2_Filled_Corner0_Rounded as SettingsFilled,
} from "#/components/icons/SettingsGear2";
import {
	UserCircle_Stroke2_Corner0_Rounded as UserCircle,
	UserCircle_Filled_Corner0_Rounded as UserCircleFilled,
} from "#/components/icons/UserCircle";
import { useAccountSwitcher } from "#/lib/hooks/useAccountSwitcher";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { isInvalidHandle, sanitizeHandle } from "#/lib/strings/handles";
import { emitSoftReset } from "#/state/events";
import { useFetchHandle } from "#/state/queries/handle";
import { useUnreadMessageCount } from "#/state/queries/messages/list-conversations";
import { useUnreadNotifications } from "#/state/queries/notifications/unread";
import { useProfilesQuery } from "#/state/queries/profile";
import { type SessionAccount, useSession, useSessionApi } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useCloseAllActiveElements } from "#/state/util";
import { LoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { PressableWithHover } from "#/view/com/util/PressableWithHover";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { NavSignupCard } from "#/view/shell/NavSignupCard";
import { PlatformInfo } from "../../../../modules/expo-bluesky-swiss-army";
import { router } from "../../../routes";

const NAV_ICON_WIDTH = 28;

function ProfileCard() {
	const { currentAccount, accounts } = useSession();
	const { logoutEveryAccount } = useSessionApi();
	const { isLoading, data } = useProfilesQuery({
		handles: accounts.map((acc) => acc.did),
	});
	const profiles = data?.profiles;
	const signOutPromptControl = Prompt.usePromptControl();
	const { leftNavMinimal } = useLayoutBreakpoints();
	const t = useTheme();

	const size = 48;

	const profile = profiles?.find((p) => p.did === currentAccount!.did);
	const otherAccounts = accounts
		.filter((acc) => acc.did !== currentAccount!.did)
		.map((account) => ({
			account,
			profile: profiles?.find((p) => p.did === account.did),
		}));

	return (
		<div
			style={{
				...a.my_md,
				...flatten(!leftNavMinimal && [a.w_full, a.align_start]),
			}}
		>
			{!isLoading && profile ? (
				<Menu.Root>
					<Menu.Trigger label={"Switch accounts"}>
						{({ props, state, control }) => {
							const active = state.hovered || state.focused || control.isOpen;
							return (
								<Button
									{...props}
									style={{
										...a.w_full,

										...a.transition_color,

										...(active ? t.atoms.bg_contrast_25 : a.transition_delay_50ms),

										...a.rounded_full,
										...a.justify_between,
										...a.align_center,
										...a.flex_row,
										...{ gap: 6 },
										...flatten(!leftNavMinimal && [a.pl_lg, a.pr_md]),
									}}
								>
									<div
										style={{
											...flatten(
												!PlatformInfo.getIsReducedMotionEnabled() && [
													a.transition_transform,
													{ transitionDuration: "250ms" },
													!active && a.transition_delay_50ms,
												],
											),
											...a.relative,
											...a.z_10,
											...(active && {
												scale: !leftNavMinimal ? 2 / 3 : 0.8,
												transform: `translateX(${!leftNavMinimal ? -22 : 0}px)`,
											}),
										}}
									>
										<UserAvatar
											avatar={profile.avatar}
											size={size}
											type={profile?.associated?.labeler ? "labeler" : "user"}
										/>
									</div>
									{!leftNavMinimal && (
										<>
											<div
												style={{
													...a.flex_1,
													...a.transition_opacity,
													...(!active && a.transition_delay_50ms),
													marginLeft: tokens.space.xl * -1,
													opacity: active ? 1 : 0,
												}}
											>
												<Text
													style={{
														...a.font_heavy,
														...a.text_sm,
														...a.leading_snug,
													}}
													numberOfLines={1}
												>
													{sanitizeDisplayName(profile.displayName || profile.handle)}
												</Text>
												<Text
													style={{
														...a.text_xs,
														...a.leading_snug,
														...t.atoms.text_contrast_medium,
													}}
													numberOfLines={1}
												>
													{sanitizeHandle(profile.handle, "@")}
												</Text>
											</div>
											<EllipsisIcon
												aria-hidden={true}
												style={{
													...t.atoms.text_contrast_medium,

													...a.transition_opacity,
													opacity: active ? 1 : 0,
												}}
												size="sm"
											/>
										</>
									)}
								</Button>
							);
						}}
					</Menu.Trigger>
					<SwitchMenuItems accounts={otherAccounts} signOutPromptControl={signOutPromptControl} />
				</Menu.Root>
			) : (
				<LoadingPlaceholder
					width={size}
					height={size}
					style={{
						...{ borderRadius: size },
						...(!leftNavMinimal && a.ml_lg),
					}}
				/>
			)}
			<Prompt.Basic
				control={signOutPromptControl}
				title={"Sign out?"}
				description={"You will be signed out of all your accounts."}
				onConfirm={() => logoutEveryAccount()}
				confirmButtonCta={"Sign out"}
				cancelButtonCta={"Cancel"}
				confirmButtonColor="negative"
			/>
		</div>
	);
}

function SwitchMenuItems({
	accounts,
	signOutPromptControl,
}: {
	accounts:
		| {
				account: SessionAccount;
				profile?: AppBskyActorDefs.ProfileViewDetailed;
		  }[]
		| undefined;
	signOutPromptControl: DialogControlProps;
}) {
	const { onPressSwitchAccount, pendingDid } = useAccountSwitcher();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const closeEverything = useCloseAllActiveElements();

	const onAddAnotherAccount = () => {
		setShowLoggedOut(true);
		closeEverything();
	};
	return (
		<Menu.Outer>
			{accounts && accounts.length > 0 && (
				<>
					<Menu.Group>
						<Menu.LabelText>Switch account</Menu.LabelText>
						{accounts.map((other) => (
							<Menu.Item
								disabled={!!pendingDid}
								style={{ minWidth: 150 }}
								key={other.account.did}
								label={`Switch to ${sanitizeHandle(
									other.profile?.handle ?? other.account.handle,
									"@",
								)}`}
								onPress={() => onPressSwitchAccount(other.account)}
							>
								<div style={{ marginLeft: tokens.space._2xs * -1 }}>
									<UserAvatar
										avatar={other.profile?.avatar}
										size={20}
										type={other.profile?.associated?.labeler ? "labeler" : "user"}
									/>
								</div>
								<Menu.ItemText>
									{sanitizeHandle(other.profile?.handle ?? other.account.handle, "@")}
								</Menu.ItemText>
							</Menu.Item>
						))}
					</Menu.Group>
					<Menu.Divider />
				</>
			)}
			<Menu.Item label={"Add another account"} onPress={onAddAnotherAccount}>
				<Menu.ItemIcon icon={PlusIcon} />
				<Menu.ItemText>Add another account</Menu.ItemText>
			</Menu.Item>
			<Menu.Item label={"Sign out"} onPress={signOutPromptControl.open}>
				<Menu.ItemIcon icon={LeaveIcon} />
				<Menu.ItemText>Sign out</Menu.ItemText>
			</Menu.Item>
		</Menu.Outer>
	);
}

interface NavItemProps {
	count?: string;
	hasNew?: boolean;
	href: string;
	icon: JSX.Element;
	iconFilled: JSX.Element;
	label: string;
}
function NavItem({ count, hasNew, href, icon, iconFilled, label }: NavItemProps) {
	const t = useTheme();
	const { currentAccount } = useSession();
	const { leftNavMinimal } = useLayoutBreakpoints();
	const [pathName] = React.useMemo(() => router.matchPath(href), [href]);
	// TODO!!
	const isProfile = false; //useMatch(routes.Profile);
	const isMatchHref = false; //useMatch(pathName);
	const location = useLocation();
	const navigate = useNavigate();
	const isCurrent = isProfile
		? isMatchHref && currentAccount?.handle && location.pathname.includes(currentAccount.handle)
		: isMatchHref;
	// const { onPress } = useLinkProps({ to: href });
	const onPressWrapped = React.useCallback(
		(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
			if (e.ctrlKey || e.metaKey || e.altKey) {
				return;
			}
			e.preventDefault();
			if (isCurrent) {
				emitSoftReset();
			} else {
				navigate(href);
			}
		},
		[navigate, href, isCurrent],
	);

	return (
		<PressableWithHover
			style={{
				...a.flex_row,
				...a.align_center,
				...a.p_md,
				...a.rounded_sm,
				...a.gap_sm,
				...a.outline_inset_1,
				...a.transition_color,
			}}
			hoverStyle={t.atoms.bg_contrast_25}
			onPress={onPressWrapped}
			href={href}
			noUnderline
		>
			<div
				style={{
					...a.align_center,
					...a.justify_center,
					...a.z_10,

					...{
						width: 24,
						height: 24,
					},

					...(leftNavMinimal && {
						width: 40,
						height: 40,
					}),
				}}
			>
				{isCurrent ? iconFilled : icon}
				{typeof count === "string" && count ? (
					<div
						style={{
							...a.absolute,
							...a.inset_0,

							...// more breathing room
							{ right: -20 },
						}}
					>
						<Text
							numberOfLines={1}
							style={{
								...a.absolute,
								...a.text_xs,
								...a.font_bold,
								...a.rounded_full,
								...a.text_center,
								...a.leading_tight,

								top: "-10%",
								left: count.length === 1 ? 12 : 8,
								backgroundColor: t.palette.primary_500,
								color: t.palette.white,
								lineHeight: `${a.text_sm.fontSize}px`,
								padding: "1px 4px",
								minWidth: 16,

								...(leftNavMinimal && {
									top: "10%",
									left: count.length === 1 ? 20 : 16,
								}),
							}}
						>
							{count}
						</Text>
					</div>
				) : hasNew ? (
					<div
						style={{
							...a.absolute,
							...a.rounded_full,

							...{
								backgroundColor: t.palette.primary_500,
								width: 8,
								height: 8,
								right: -2,
								top: -4,
							},

							...(leftNavMinimal && {
								right: 4,
								top: 2,
							}),
						}}
					/>
				) : null}
			</div>
			{!leftNavMinimal && (
				<Text
					style={{
						...a.text_xl,
						...(isCurrent ? a.font_heavy : a.font_normal),
					}}
				>
					{label}
				</Text>
			)}
		</PressableWithHover>
	);
}

function ComposeBtn() {
	const { currentAccount } = useSession();
	const { openComposer } = useComposerControls();
	const { leftNavMinimal } = useLayoutBreakpoints();
	const [isFetchingHandle, setIsFetchingHandle] = React.useState(false);
	const fetchHandle = useFetchHandle();

	const getProfileHandle = async () => {
		const currentLocation = useLocation();
		const currentParams = useParams();

		if (currentLocation.pathname.startsWith("/profile")) {
			let handle: string | undefined = currentParams.name;

			if (handle?.startsWith("did:")) {
				try {
					setIsFetchingHandle(true);
					handle = await fetchHandle(handle);
				} catch (e) {
					handle = undefined;
				} finally {
					setIsFetchingHandle(false);
				}
			}

			if (!handle || handle === currentAccount?.handle || isInvalidHandle(handle)) return undefined;

			return handle;
		}

		return undefined;
	};

	const onPressCompose = async () => openComposer({ mention: await getProfileHandle() });

	if (leftNavMinimal) {
		return null;
	}

	return (
		<div
			style={{
				...a.flex_row,
				...a.pl_md,
				...a.pt_xl,
			}}
		>
			<Button
				disabled={isFetchingHandle}
				label={"Compose new post"}
				onPress={onPressCompose}
				size="large"
				variant="solid"
				color="primary"
				style={a.rounded_full}
			>
				<ButtonIcon icon={EditBig} position="left" />
				<ButtonText>New Post</ButtonText>
			</Button>
		</div>
	);
}

function ChatNavItem() {
	const pal = usePalette("default");
	const numUnreadMessages = useUnreadMessageCount();

	return (
		<NavItem
			href="/messages"
			count={numUnreadMessages.numUnread}
			hasNew={numUnreadMessages.hasNew}
			icon={<Message style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
			iconFilled={<MessageFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
			label={"Chat"}
		/>
	);
}

export function DesktopLeftNav() {
	const { hasSession, currentAccount } = useSession();
	const pal = usePalette("default");
	const { isDesktop } = useWebMediaQueries();
	const { leftNavMinimal, centerColumnOffset } = useLayoutBreakpoints();
	const numUnreadNotifications = useUnreadNotifications();

	if (!hasSession && !isDesktop) {
		return null;
	}

	return (
		<nav
			style={{
				...a.px_xl,
				...styles.leftNav,
				...(leftNavMinimal && styles.leftNavMinimal),
				transform: `translateX(${centerColumnOffset ? -450 : -300}px) translateX(-100%) ${a.scrollbar_offset.transform}`,
			}}
		>
			{hasSession ? (
				<ProfileCard />
			) : isDesktop ? (
				<div style={a.pt_xl}>
					<NavSignupCard />
				</div>
			) : null}
			{hasSession && (
				<>
					<NavItem
						href="/"
						// hasNew={hasHomeBadge && gate("remove_show_latest_button")}
						icon={<Home aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<HomeFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Home"}
					/>
					<NavItem
						href="/search"
						icon={<MagnifyingGlass style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						iconFilled={
							<MagnifyingGlassFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />
						}
						label={"Search"}
					/>
					<NavItem
						href="/notifications"
						count={numUnreadNotifications}
						icon={<Bell aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<BellFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Notifications"}
					/>
					<ChatNavItem />
					<NavItem
						href="/feeds"
						icon={<Hashtag style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						iconFilled={<HashtagFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						label={"Feeds"}
					/>
					<NavItem
						href="/lists"
						icon={<List style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						iconFilled={<ListFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						label={"Lists"}
					/>
					<NavItem
						href={currentAccount ? makeProfileLink(currentAccount) : "/"}
						icon={<UserCircle aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<UserCircleFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Profile"}
					/>
					<NavItem
						href="/settings"
						icon={<Settings aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<SettingsFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Settings"}
					/>

					<ComposeBtn />
				</>
			)}
		</nav>
	);
}

const styles = {
	leftNav: {
		position: "fixed",
		top: 0,
		paddingTop: 10,
		paddingBottom: 10,
		left: "50%",
		width: 240,
		maxHeight: "100vh",
		overflowY: "auto",
	},
	leftNavMinimal: {
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
		height: "100%",
		width: 86,
		alignItems: "center",
		overflowX: "hidden",
	},
	backBtn: {
		position: "absolute",
		top: 12,
		right: 12,
		width: 30,
		height: 30,
	},
} satisfies Record<string, React.CSSProperties>;
