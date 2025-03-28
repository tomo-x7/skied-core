import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { InfoCircleIcon } from "#/lib/icons";
import { TextLink } from "../util/Link";

export function DiscoverFallbackHeader() {
	const pal = usePalette("default");
	return (
		<div
			style={{
				...{
					flexDirection: "row",
					alignItems: "center",
					paddingTop: 12,
					paddingBottom: 12,
					paddingLeft: 12,
					paddingRight: 12,
					borderTopWidth: 1,
				},

				...pal.border,
				...pal.viewLight,
			}}
		>
			<div style={{ width: 68, paddingLeft: 12 }}>
				<InfoCircleIcon size={36} style={pal.textLight} strokeWidth={1.5} />
			</div>
			<div style={{ flex: 1 }}>
				<Text type="md" style={pal.text}>
					<>
						We ran out of posts from your follows. Here's the latest from{" "}
						<TextLink
							type="md-medium"
							href="/profile/bsky.app/feed/whats-hot"
							text="Discover"
							style={pal.link}
						/>
						.
					</>
				</Text>
			</div>
		</div>
	);
}
