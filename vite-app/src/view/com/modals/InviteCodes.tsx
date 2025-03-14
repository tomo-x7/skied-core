import type { ComAtprotoServerDefs } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setStringAsync } from "expo-clipboard";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { makeProfileLink } from "#/lib/routes/links";
import { cleanError } from "#/lib/strings/errors";
import { useInvitesAPI, useInvitesState } from "#/state/invites";
import { useModalControls } from "#/state/modals";
import { type InviteCodesQueryResponse, useInviteCodesQuery } from "#/state/queries/invites";
import { Link } from "../util/Link";
import * as Toast from "../util/Toast";
import { UserInfoText } from "../util/UserInfoText";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Button } from "../util/forms/Button";
import { Text } from "../util/text/Text";
import { ScrollView } from "./util";

export const snapPoints = ["70%"];

export function Component() {
	const { isLoading, data: invites, error } = useInviteCodesQuery();

	return error ? (
		<ErrorMessage message={cleanError(error)} />
	) : isLoading || !invites ? (
		<View style={{ padding: 18 }}>
			<ActivityIndicator />
		</View>
	) : (
		<Inner invites={invites} />
	);
}

export function Inner({ invites }: { invites: InviteCodesQueryResponse }) {
	const pal = usePalette("default");
	const { closeModal } = useModalControls();
	const { isTabletOrDesktop } = useWebMediaQueries();

	const onClose = React.useCallback(() => {
		closeModal();
	}, [closeModal]);

	if (invites.all.length === 0) {
		return (
			<View style={[styles.container, pal.view]} testID="inviteCodesModal">
				<View style={[styles.empty, pal.viewLight]}>
					<Text type="lg" style={[pal.text, styles.emptyText]}>
						You don't have any invite codes yet! We'll send you some when you've been on Bluesky for a
						little longer.
					</Text>
				</View>
				<View style={styles.flex1} />
				<View style={[styles.btnContainer, isTabletOrDesktop && styles.btnContainerDesktop]}>
					<Button
						type="primary"
						label={"Done"}
						style={styles.btn}
						labelStyle={styles.btnLabel}
						onPress={onClose}
					/>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, pal.view]} testID="inviteCodesModal">
			<Text type="title-xl" style={[styles.title, pal.text]}>
				Invite a Friend
			</Text>
			<Text type="lg" style={[styles.description, pal.text]}>
				Each code works once. You'll receive more invite codes periodically.
			</Text>
			<ScrollView style={[styles.scrollContainer, pal.border]}>
				{invites.available.map((invite, i) => (
					<InviteCode testID={`inviteCode-${i}`} key={invite.code} invite={invite} invites={invites} />
				))}
				{invites.used.map((invite, i) => (
					<InviteCode used testID={`inviteCode-${i}`} key={invite.code} invite={invite} invites={invites} />
				))}
			</ScrollView>
			<View style={styles.btnContainer}>
				<Button
					testID="closeBtn"
					type="primary"
					label={"Done"}
					style={styles.btn}
					labelStyle={styles.btnLabel}
					onPress={onClose}
				/>
			</View>
		</View>
	);
}

function InviteCode({
	testID,
	invite,
	used,
	invites,
}: {
	testID: string;
	invite: ComAtprotoServerDefs.InviteCode;
	used?: boolean;
	invites: InviteCodesQueryResponse;
}) {
	const pal = usePalette("default");
	const invitesState = useInvitesState();
	const { setInviteCopied } = useInvitesAPI();
	const uses = invite.uses;

	const onPress = React.useCallback(() => {
		setStringAsync(invite.code);
		Toast.show("Copied to clipboard", "clipboard-check");
		setInviteCopied(invite.code);
	}, [setInviteCopied, invite]);

	return (
		<View style={[pal.border, { borderBottomWidth: 1, paddingHorizontal: 20, paddingVertical: 14 }]}>
			<TouchableOpacity
				testID={testID}
				style={[styles.inviteCode]}
				onPress={onPress}
				accessibilityRole="button"
				accessibilityLabel={
					invites.available.length === 1
						? "Invite codes: 1 available"
						: `Invite codes: ${invites.available.length} available`
				}
				accessibilityHint={"Opens list of invite codes"}
			>
				<Text
					testID={`${testID}-code`}
					type={used ? "md" : "md-bold"}
					style={used ? [pal.textLight, styles.strikeThrough] : pal.text}
				>
					{invite.code}
				</Text>
				<View style={styles.flex1} />
				{!used && invitesState.copiedInvites.includes(invite.code) && (
					<Text style={[pal.textLight, styles.codeCopied]}>Copied</Text>
				)}
				{/* @ts-ignore */}
				{!used && <FontAwesomeIcon icon={["far", "clone"]} style={pal.text} />}
			</TouchableOpacity>
			{uses.length > 0 ? (
				<View
					style={{
						flexDirection: "column",
						gap: 8,
						paddingTop: 6,
					}}
				>
					<Text style={pal.text}>
						Used by:{" "}
						{uses.map((use, i) => (
							<Link
								key={use.usedBy}
								href={makeProfileLink({ handle: use.usedBy, did: "" })}
								style={{
									flexDirection: "row",
								}}
							>
								<UserInfoText did={use.usedBy} style={pal.link} />
								{i !== uses.length - 1 && <Text style={pal.text}>, </Text>}
							</Link>
						))}
					</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 0,
	},
	title: {
		textAlign: "center",
		marginTop: 12,
		marginBottom: 12,
	},
	description: {
		textAlign: "center",
		paddingHorizontal: 42,
		marginBottom: 14,
	},

	scrollContainer: {
		flex: 1,
		borderTopWidth: 1,
		marginTop: 4,
		marginBottom: 16,
	},

	flex1: {
		flex: 1,
	},
	empty: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderRadius: 16,
		marginHorizontal: 24,
		marginTop: 10,
	},
	emptyText: {
		textAlign: "center",
	},

	inviteCode: {
		flexDirection: "row",
		alignItems: "center",
	},
	codeCopied: {
		marginRight: 8,
	},
	strikeThrough: {
		textDecorationLine: "line-through",
		textDecorationStyle: "solid",
	},

	btnContainer: {
		flexDirection: "row",
		justifyContent: "center",
	},
	btnContainerDesktop: {
		marginTop: 14,
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 32,
		paddingHorizontal: 60,
		paddingVertical: 14,
	},
	btnLabel: {
		fontSize: 18,
	},
});
