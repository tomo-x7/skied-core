import type { AppBskyFeedPostgate } from "@atproto/api";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { PostInteractionSettingsControlledDialog } from "#/components/dialogs/PostInteractionSettingsDialog";
import { Earth_Stroke2_Corner0_Rounded as Earth } from "#/components/icons/Globe";
import { Group3_Stroke2_Corner0_Rounded as Group } from "#/components/icons/Group";
import type { ThreadgateAllowUISetting } from "#/state/queries/threadgate";

export function ThreadgateBtn({
	postgate,
	onChangePostgate,
	threadgateAllowUISettings,
	onChangeThreadgateAllowUISettings,
}: {
	postgate: AppBskyFeedPostgate.Record;
	onChangePostgate: (v: AppBskyFeedPostgate.Record) => void;

	threadgateAllowUISettings: ThreadgateAllowUISetting[];
	onChangeThreadgateAllowUISettings: (v: ThreadgateAllowUISetting[]) => void;

	style?: React.CSSProperties;
}) {
	const control = Dialog.useDialogControl();

	const onPress = () => {
		control.open();
	};

	const anyoneCanReply = threadgateAllowUISettings.length === 1 && threadgateAllowUISettings[0].type === "everybody";
	const anyoneCanQuote = !postgate.embeddingRules || postgate.embeddingRules.length === 0;
	const anyoneCanInteract = anyoneCanReply && anyoneCanQuote;
	const label = anyoneCanInteract ? "Anybody can interact" : "Interaction limited";

	return (
		<>
			<Button variant="solid" color="secondary" size="small" onPress={onPress} label={label}>
				<ButtonIcon icon={anyoneCanInteract ? Earth : Group} />
				<ButtonText
				//  numberOfLines={1}
				>
					{label}
				</ButtonText>
			</Button>
			<PostInteractionSettingsControlledDialog
				control={control}
				onSave={() => {
					control.close();
				}}
				postgate={postgate}
				onChangePostgate={onChangePostgate}
				threadgateAllowUISettings={threadgateAllowUISettings}
				onChangeThreadgateAllowUISettings={onChangeThreadgateAllowUISettings}
			/>
		</>
	);
}
