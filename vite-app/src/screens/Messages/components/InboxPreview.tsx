import type { ChatBskyActorDefs } from "@atproto/api";

import { atoms as a, useTheme } from "#/alf";
import { AvatarStack } from "#/components/AvatarStack";
import { ButtonIcon, ButtonText } from "#/components/Button";
import { Link } from "#/components/Link";
import { ArrowRight_Stroke2_Corner0_Rounded as ArrowRightIcon } from "#/components/icons/Arrow";
import { Envelope_Stroke2_Corner2_Rounded as EnvelopeIcon } from "#/components/icons/Envelope";

export function InboxPreview({
	profiles,
}: // count,
{
	profiles: ChatBskyActorDefs.ProfileViewBasic[];
	count: number;
}) {
	const t = useTheme();
	return (
		<Link
			label={"Chat request inbox"}
			style={{
				...a.flex_1,
				...a.px_xl,
				...a.py_sm,
				...a.flex_row,
				...a.align_center,
				...a.gap_md,
				...a.border_t,
				...{ marginTop: a.border_t.borderTopWidth * -1 },
				...a.border_b,
				...t.atoms.border_contrast_low,
				...{ minHeight: 44 },
				...a.rounded_0,
			}}
			to="/messages/inbox"
			color="secondary"
			variant="solid"
		>
			<div style={a.relative}>
				<ButtonIcon icon={EnvelopeIcon} size="lg" />
				{profiles.length > 0 && (
					<div
						style={{
							...a.absolute,
							...a.rounded_full,
							...a.z_20,

							...{
								top: -4,
								right: -5,
								width: 10,
								height: 10,
								backgroundColor: t.palette.primary_500,
							},
						}}
					/>
				)}
			</div>
			<ButtonText
				style={{
					...a.flex_1,
					...a.font_bold,
					...a.text_left,
				}}
				// TODO
				// numberOfLines={1}
			>
				Chat requests
			</ButtonText>
			<AvatarStack profiles={profiles} backgroundColor={t.atoms.bg_contrast_25.backgroundColor} />
			<ButtonIcon icon={ArrowRightIcon} size="lg" />
		</Link>
	);
}
