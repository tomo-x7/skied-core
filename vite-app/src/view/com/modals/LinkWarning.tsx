import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { shareUrl } from "#/lib/sharing";
import { isPossiblyAUrl, splitApexDomain } from "#/lib/strings/url-helpers";
import { colors, s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";
import { Button } from "#/view/com/util/forms/Button";
import { Text } from "#/view/com/util/text/Text";
import { ScrollView } from "./util";

export const snapPoints = ["50%"];

export function Component({
	text,
	href,
	share,
}: {
	text: string;
	href: string;
	share?: boolean;
}) {
	const pal = usePalette("default");
	const { closeModal } = useModalControls();
	const { isMobile } = useWebMediaQueries();
	const potentiallyMisleading = isPossiblyAUrl(text);
	const openLink = useOpenLink();

	const onPressVisit = () => {
		closeModal();
		if (share) {
			shareUrl(href);
		} else {
			openLink(href);
		}
	};

	return (
		<SafeAreaView style={[s.flex1, pal.view]}>
			<ScrollView testID="linkWarningModal" style={[s.flex1, isMobile && { paddingHorizontal: 18 }]}>
				<View style={styles.titleSection}>
					{potentiallyMisleading ? (
						<>
							{/* @ts-ignore */}
							<FontAwesomeIcon icon="circle-exclamation" color={pal.colors.text} size={18} />
							<Text type="title-lg" style={[pal.text, styles.title]}>
								Potentially Misleading Link
							</Text>
						</>
					) : (
						<Text type="title-lg" style={[pal.text, styles.title]}>
							Leaving Bluesky
						</Text>
					)}
				</View>

				<View style={{ gap: 10 }}>
					<Text type="lg" style={pal.text}>
						This link is taking you to the following website:
					</Text>

					<LinkBox href={href} />

					{potentiallyMisleading && (
						<Text type="lg" style={pal.text}>
							Make sure this is where you intend to go!
						</Text>
					)}
				</View>

				<View style={[styles.btnContainer, isMobile && { paddingBottom: 40 }]}>
					<Button
						testID="confirmBtn"
						type="primary"
						onPress={onPressVisit}
						accessibilityLabel={share ? "Share Link" : "Visit Site"}
						accessibilityHint={share ? "Shares the linked website" : "Opens the linked website"}
						label={share ? "Share Link" : "Visit Site"}
						labelContainerStyle={{ justifyContent: "center", padding: 4 }}
						labelStyle={[s.f18]}
					/>
					<Button
						testID="cancelBtn"
						type="default"
						onPress={() => {
							closeModal();
						}}
						accessibilityLabel={"Cancel"}
						accessibilityHint={"Cancels opening the linked website"}
						label={"Cancel"}
						labelContainerStyle={{ justifyContent: "center", padding: 4 }}
						labelStyle={[s.f18]}
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function LinkBox({ href }: { href: string }) {
	const pal = usePalette("default");
	const [scheme, hostname, rest] = React.useMemo(() => {
		try {
			const urlp = new URL(href);
			const [subdomain, apexdomain] = splitApexDomain(urlp.hostname);
			return [`${urlp.protocol}//${subdomain}`, apexdomain, urlp.pathname + urlp.search + urlp.hash];
		} catch {
			return ["", href, ""];
		}
	}, [href]);
	return (
		<View style={[pal.view, pal.border, styles.linkBox]}>
			<Text type="lg" style={pal.textLight}>
				{scheme}
				<Text type="lg-bold" style={pal.text}>
					{hostname}
				</Text>
				{rest}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 0,
	},
	titleSection: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 6,
		paddingTop: 0,
		paddingBottom: 14,
	},
	title: {
		textAlign: "center",
		fontWeight: "600",
	},
	linkBox: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 6,
		borderWidth: 1,
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
		paddingTop: 20,
		gap: 6,
	},
});
