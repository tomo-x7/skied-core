import type { AppBskyActorDefs, AppBskyGraphDefs } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, View } from "react-native";

import { HITSLOP_20 } from "#/lib/constants";
import { useIsKeyboardVisible } from "#/lib/hooks/useIsKeyboardVisible";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { cleanError } from "#/lib/strings/errors";
import { sanitizeHandle } from "#/lib/strings/handles";
import { colors, s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";
import { useActorAutocompleteQuery } from "#/state/queries/actor-autocomplete";
import {
	type ListMembersip,
	getMembership,
	useDangerousListMembershipsQuery,
	useListMembershipAddMutation,
	useListMembershipRemoveMutation,
} from "#/state/queries/list-memberships";
import * as Toast from "../util/Toast";
import { UserAvatar } from "../util/UserAvatar";
import { Button } from "../util/forms/Button";
import { Text } from "../util/text/Text";
import { ScrollView, TextInput } from "./util";

export const snapPoints = ["90%"];

export function Component({
	list,
	onChange,
}: {
	list: AppBskyGraphDefs.ListView;
	onChange?: (type: "add" | "remove", profile: AppBskyActorDefs.ProfileViewBasic) => void;
}) {
	const pal = usePalette("default");
	const { closeModal } = useModalControls();
	const { isMobile } = useWebMediaQueries();
	const [query, setQuery] = useState("");
	const autocomplete = useActorAutocompleteQuery(query);
	const { data: memberships } = useDangerousListMembershipsQuery();
	const [isKeyboardVisible] = useIsKeyboardVisible();

	const onPressCancelSearch = useCallback(() => setQuery(""), []);

	return (
		<SafeAreaView testID="listAddUserModal" style={[pal.view, styles.fixedHeight]}>
			<View style={[s.flex1, isMobile && { paddingHorizontal: 18 }]}>
				<View style={[styles.searchContainer, pal.border]}>
					{/* @ts-ignore */}
					<FontAwesomeIcon icon="search" size={16} />
					<TextInput
						testID="searchInput"
						style={[styles.searchInput, pal.border, pal.text]}
						placeholder={"Search for users"}
						placeholderTextColor={pal.colors.textLight}
						value={query}
						onChangeText={setQuery}
						accessible={true}
						accessibilityLabel={"Search"}
						accessibilityHint=""
						autoFocus
						autoCapitalize="none"
						autoComplete="off"
						autoCorrect={false}
						selectTextOnFocus
					/>
					{query ? (
						<Pressable
							onPress={onPressCancelSearch}
							accessibilityRole="button"
							accessibilityLabel={"Cancel search"}
							accessibilityHint={"Exits inputting search query"}
							onAccessibilityEscape={onPressCancelSearch}
							hitSlop={HITSLOP_20}
						>
							{/* @ts-ignore */}
							<FontAwesomeIcon icon="xmark" size={16} color={pal.colors.textLight} />
						</Pressable>
					) : undefined}
				</View>
				<ScrollView style={[s.flex1]} keyboardDismissMode="none" keyboardShouldPersistTaps="always">
					{autocomplete.isLoading ? (
						<View style={{ marginVertical: 20 }}>
							<ActivityIndicator />
						</View>
					) : autocomplete.data?.length ? (
						<>
							{autocomplete.data.slice(0, 40).map((item, i) => (
								<UserResult
									key={item.did}
									list={list}
									profile={item}
									memberships={memberships}
									noBorder={i === 0}
									onChange={onChange}
								/>
							))}
						</>
					) : (
						<Text type="xl" style={[pal.textLight, { paddingHorizontal: 12, paddingVertical: 16 }]}>
							<>No results found for {query}</>
						</Text>
					)}
				</ScrollView>
				<View style={[styles.btnContainer, { paddingBottom: isKeyboardVisible ? 10 : 20 }]}>
					<Button
						testID="doneBtn"
						type="default"
						onPress={() => {
							closeModal();
						}}
						accessibilityLabel={"Done"}
						accessibilityHint=""
						label={"Done"}
						labelContainerStyle={{ justifyContent: "center", padding: 4 }}
						labelStyle={[s.f18]}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
}

function UserResult({
	profile,
	list,
	memberships,
	noBorder,
	onChange,
}: {
	profile: AppBskyActorDefs.ProfileViewBasic;
	list: AppBskyGraphDefs.ListView;
	memberships: ListMembersip[] | undefined;
	noBorder: boolean;
	onChange?: (type: "add" | "remove", profile: AppBskyActorDefs.ProfileViewBasic) => void | undefined;
}) {
	const pal = usePalette("default");
	const [isProcessing, setIsProcessing] = useState(false);
	const membership = React.useMemo(
		() => getMembership(memberships, list.uri, profile.did),
		[memberships, list.uri, profile.did],
	);
	const listMembershipAddMutation = useListMembershipAddMutation();
	const listMembershipRemoveMutation = useListMembershipRemoveMutation();

	const onToggleMembership = useCallback(async () => {
		if (typeof membership === "undefined") {
			return;
		}
		setIsProcessing(true);
		try {
			if (membership === false) {
				await listMembershipAddMutation.mutateAsync({
					listUri: list.uri,
					actorDid: profile.did,
				});
				Toast.show("Added to list");
				onChange?.("add", profile);
			} else {
				await listMembershipRemoveMutation.mutateAsync({
					listUri: list.uri,
					actorDid: profile.did,
					membershipUri: membership,
				});
				Toast.show("Removed from list");
				onChange?.("remove", profile);
			}
		} catch (e) {
			Toast.show(cleanError(e), "xmark");
		} finally {
			setIsProcessing(false);
		}
	}, [list, profile, membership, onChange, listMembershipAddMutation, listMembershipRemoveMutation]);

	return (
		<View
			style={[
				pal.border,
				{
					flexDirection: "row",
					alignItems: "center",
					borderTopWidth: noBorder ? 0 : 1,
					paddingHorizontal: 8,
				},
			]}
		>
			<View
				style={{
					width: 54,
					paddingLeft: 4,
				}}
			>
				<UserAvatar size={40} avatar={profile.avatar} type={profile.associated?.labeler ? "labeler" : "user"} />
			</View>
			<View
				style={{
					flex: 1,
					paddingRight: 10,
					paddingTop: 10,
					paddingBottom: 10,
				}}
			>
				<Text type="lg" style={[s.bold, pal.text]} numberOfLines={1} lineHeight={1.2}>
					{sanitizeDisplayName(profile.displayName || sanitizeHandle(profile.handle))}
				</Text>
				<Text type="md" style={[pal.textLight]} numberOfLines={1}>
					{sanitizeHandle(profile.handle, "@")}
				</Text>
				{!!profile.viewer?.followedBy && <View style={s.flexRow} />}
			</View>
			<View>
				{isProcessing || typeof membership === "undefined" ? (
					<ActivityIndicator />
				) : (
					<Button
						testID={`user-${profile.handle}-addBtn`}
						type="default"
						label={membership === false ? "Add" : "Remove"}
						onPress={onToggleMembership}
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	fixedHeight: {
		// @ts-ignore web only -prf
		height: "80vh",
	},
	titleSection: {
		paddingTop: 0,
		paddingBottom: 14,
	},
	title: {
		textAlign: "center",
		fontWeight: "600",
		marginBottom: 5,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderWidth: 1,
		borderRadius: 24,
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	searchInput: {
		fontSize: 16,
		flex: 1,
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 32,
		padding: 14,
		backgroundColor: colors.blue3,
	},
	btnContainer: {
		paddingTop: 10,
	},
});
