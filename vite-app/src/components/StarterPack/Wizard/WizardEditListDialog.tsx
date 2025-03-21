import type { AppBskyActorDefs, ModerationOpts } from "@atproto/api";
import type { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { useRef } from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { WizardFeedCard, WizardProfileCard } from "#/components/StarterPack/Wizard/WizardListCard";
import { Text } from "#/components/Typography";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import type { WizardAction, WizardState } from "#/screens/StarterPack/Wizard/State";
import { useSession } from "#/state/session";
import type { ListMethods } from "#/view/com/util/List";

function keyExtractor(item: AppBskyActorDefs.ProfileViewBasic | GeneratorView, index: number) {
	return `${item.did}-${index}`;
}

export function WizardEditListDialog({
	control,
	state,
	dispatch,
	moderationOpts,
	profile,
}: {
	control: Dialog.DialogControlProps;
	state: WizardState;
	dispatch: (action: WizardAction) => void;
	moderationOpts: ModerationOpts;
	profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
	const t = useTheme();
	const { currentAccount } = useSession();
	const initialNumToRender = useInitialNumToRender();

	const listRef = useRef<ListMethods>(null);

	const getData = () => {
		if (state.currentStep === "Feeds") return state.feeds;

		return [profile, ...state.profiles.filter((p) => p.did !== currentAccount?.did)];
	};

	const renderItem = ({ item }: { item: any; index: number }) =>
		state.currentStep === "Profiles" ? (
			<WizardProfileCard
				profile={item}
				btnType="remove"
				state={state}
				dispatch={dispatch}
				moderationOpts={moderationOpts}
			/>
		) : (
			<WizardFeedCard
				generator={item}
				btnType="remove"
				state={state}
				dispatch={dispatch}
				moderationOpts={moderationOpts}
			/>
		);

	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.InnerFlatList
				ref={listRef}
				data={getData()}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ListHeaderComponent={
					<div
						style={{
							...a.flex_row,
							...a.justify_between,
							...a.border_b,
							...a.px_sm,
							...a.mb_sm,
							...t.atoms.bg,
							...t.atoms.border_contrast_medium,
							...a.align_center,
							...{ height: 48 },
						}}
					>
						<div style={{ width: 60 }} />
						<Text
							style={{
								...a.font_bold,
								...a.text_xl,
							}}
						>
							{state.currentStep === "Profiles" ? <>Edit People</> : <>Edit Feeds</>}
						</Text>
						<div style={{ width: 60 }}>
							<Button
								label={"Close"}
								variant="ghost"
								color="primary"
								size="small"
								onPress={() => control.close()}
							>
								<ButtonText>Close</ButtonText>
							</Button>
						</div>
					</div>
				}
				stickyHeaderIndices={[0]}
				style={{
					...a.py_0,
					...{ height: "100vh", maxHeight: 600 },
					...a.px_0,
				}}
				webInnerStyle={{ ...a.py_0, maxWidth: 500, minWidth: 200 }}
				keyboardDismissMode="on-drag"
				initialNumToRender={initialNumToRender}
			/>
		</Dialog.Outer>
	);
}
