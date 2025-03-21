import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigation } from "@react-navigation/native";
import React from "react";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { MagnifyingGlassIcon } from "#/lib/icons";
import type { NavigationProp } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { Button } from "../util/forms/Button";

export function CustomFeedEmptyState() {
	const pal = usePalette("default");
	const palInverted = usePalette("inverted");
	const navigation = useNavigation<NavigationProp>();

	const onPressFindAccounts = React.useCallback(() => {
		navigation.navigate("Search", {});
	}, [navigation]);

	return (
		<div style={styles.emptyContainer}>
			<div style={styles.emptyIconContainer}>
				<MagnifyingGlassIcon
					style={{
						...styles.emptyIcon,
						...pal.text,
					}}
					size={62}
				/>
			</div>
			<Text
				type="xl-medium"
				style={{
					...s.textCenter,
					...pal.text,
				}}
			>
				This feed is empty! You may need to follow more users or tune your language settings.
			</Text>
			<Button type="inverted" style={styles.emptyBtn} onPress={onPressFindAccounts}>
				<Text type="lg-medium" style={palInverted.text}>
					Find accounts to follow
				</Text>
				{/* @ts-expect-error */}
				<FontAwesomeIcon icon="angle-right" style={palInverted.text} size={14} />
			</Button>
		</div>
	);
}
const styles = {
	emptyContainer: {
		height: "100%",
		padding: "40px 30px",
	},
	emptyIconContainer: {
		marginBottom: 16,
	},
	emptyIcon: {
		marginLeft: "auto",
		marginRight: "auto",
	},
	emptyBtn: {
		marginTop: 20,
		marginBottom: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "18px 24px",
		borderRadius: 30,
	},

	feedsTip: {
		position: "absolute",
		left: 22,
	},
	feedsTipArrow: {
		marginLeft: 32,
		marginTop: 8,
	},
} satisfies Record<string, React.CSSProperties>;
