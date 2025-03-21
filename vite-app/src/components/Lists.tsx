import type React from "react";
import { memo } from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Error } from "#/components/Error";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { cleanError } from "#/lib/strings/errors";
import { CenteredView } from "#/view/com/util/Views";

export function ListFooter({
	isFetchingNextPage,
	hasNextPage,
	error,
	onRetry,
	height,
	style,
	showEndMessage = false,
	endMessageText,
	renderEndMessage,
}: {
	isFetchingNextPage?: boolean;
	hasNextPage?: boolean;
	error?: string;
	onRetry?: () => Promise<unknown>;
	height?: number;
	style?: React.CSSProperties;
	showEndMessage?: boolean;
	endMessageText?: string;
	renderEndMessage?: () => React.ReactNode;
}) {
	const t = useTheme();

	return (
		<div
			style={{
				...a.w_full,
				...a.align_center,
				...a.border_t,
				...a.pb_lg,
				...t.atoms.border_contrast_low,
				...{ height: height ?? 180, paddingTop: 30 },
				...style,
			}}
		>
			{isFetchingNextPage ? (
				<Loader size="xl" />
			) : error ? (
				<ListFooterMaybeError error={error} onRetry={onRetry} />
			) : !hasNextPage && showEndMessage ? (
				renderEndMessage ? (
					renderEndMessage()
				) : (
					<Text
						style={{
							...a.text_sm,
							...t.atoms.text_contrast_low,
						}}
					>
						{endMessageText ?? "You have reached the end"}
					</Text>
				)
			) : null}
		</div>
	);
}

function ListFooterMaybeError({
	error,
	onRetry,
}: {
	error?: string;
	onRetry?: () => Promise<unknown>;
}) {
	const t = useTheme();

	if (!error) return null;

	return (
		<div
			style={{
				...a.w_full,
				...a.px_lg,
			}}
		>
			<div
				style={{
					...a.flex_row,
					...a.gap_md,
					...a.p_md,
					...a.rounded_sm,
					...a.align_center,
					...t.atoms.bg_contrast_25,
				}}
			>
				<Text
					style={{
						...a.flex_1,
						...a.text_sm,
						...t.atoms.text_contrast_medium,
					}}
					numberOfLines={2}
				>
					{error ? cleanError(error) : <>Oops, something went wrong!</>}
				</Text>
				<Button
					variant="gradient"
					label={"Press to retry"}
					style={{
						...a.align_center,
						...a.justify_center,
						...a.rounded_sm,
						...a.overflow_hidden,
						...a.px_md,
						...a.py_sm,
					}}
					onPress={onRetry}
				>
					<ButtonText>Retry</ButtonText>
				</Button>
			</div>
		</div>
	);
}

let ListMaybePlaceholder = ({
	isLoading,
	noEmpty,
	isError,
	emptyTitle,
	emptyMessage,
	errorTitle,
	errorMessage,
	emptyType = "page",
	onRetry,
	onGoBack,
	hideBackButton,
	sideBorders,
	topBorder = false,
}: {
	isLoading: boolean;
	noEmpty?: boolean;
	isError?: boolean;
	emptyTitle?: string;
	emptyMessage?: string;
	errorTitle?: string;
	errorMessage?: string;
	emptyType?: "page" | "results";
	onRetry?: () => Promise<unknown>;
	onGoBack?: () => void;
	hideBackButton?: boolean;
	sideBorders?: boolean;
	topBorder?: boolean;
}): React.ReactNode => {
	const t = useTheme();
	const { gtMobile, gtTablet } = useBreakpoints();

	if (isLoading) {
		return (
			<CenteredView
				style={{
					...a.h_full_vh,
					...a.align_center,
					...(!gtMobile ? a.justify_between : a.gap_5xl),
					...t.atoms.border_contrast_low,
					paddingTop: 175,
					paddingBottom: 110,
				}}
				sideBorders={sideBorders ?? gtMobile}
				topBorder={topBorder && !gtTablet}
			>
				<div
					style={{
						...a.w_full,
						...a.align_center,
						...{ top: 100 },
					}}
				>
					<Loader size="xl" />
				</div>
			</CenteredView>
		);
	}

	if (isError) {
		return (
			<Error
				title={errorTitle ?? "Oops!"}
				message={errorMessage ?? "Something went wrong!"}
				onRetry={onRetry}
				onGoBack={onGoBack}
				sideBorders={sideBorders}
				hideBackButton={hideBackButton}
			/>
		);
	}

	if (!noEmpty) {
		return (
			<Error
				title={emptyTitle ?? (emptyType === "results" ? "No results found" : "Page not found")}
				message={emptyMessage ?? `We're sorry! We can't find the page you were looking for.`}
				onRetry={onRetry}
				onGoBack={onGoBack}
				hideBackButton={hideBackButton}
				sideBorders={sideBorders}
			/>
		);
	}

	return null;
};
ListMaybePlaceholder = memo(ListMaybePlaceholder);
export { ListMaybePlaceholder };
