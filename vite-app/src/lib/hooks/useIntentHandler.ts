import React from "react";

import { useIntentDialogs } from "#/components/intents/IntentDialogs";
import { useSession } from "#/state/session";
import { useComposerControls } from "#/state/shell";
import { useCloseAllActiveElements } from "#/state/util";

type IntentType = "compose" | "verify-email";

const VALID_IMAGE_REGEX = /^[\w.:\-_/]+\|\d+(\.\d+)?\|\d+(\.\d+)?$/;

// This needs to stay outside of react to persist between account switches
let previousIntentUrl = "";

export function useIntentHandler() {
	const incomingUrl = location.href;
	const composeIntent = useComposeIntent();
	const verifyEmailIntent = useVerifyEmailIntent();

	React.useEffect(() => {
		const handleIncomingURL = (url: string) => {
			const urlp = new URL(url);
			const [intent, intentType] = urlp.pathname.split("/");

			// On native, our links look like bluesky://intent/SomeIntent, so we have to check the hostname for the
			// intent check. On web, we have to check the first part of the path since we have an actual hostname
			const isIntent = intent === "intent";
			const params = urlp.searchParams;

			if (!isIntent) return;

			switch (intentType as IntentType) {
				case "compose": {
					composeIntent({
						text: params.get("text"),
						imageUrisStr: params.get("imageUris"),
						videoUri: params.get("videoUri"),
					});
					return;
				}
				case "verify-email": {
					const code = params.get("code");
					if (!code) return;
					verifyEmailIntent(code);
					return;
				}
				default: {
					return;
				}
			}
		};

		if (incomingUrl) {
			if (previousIntentUrl === incomingUrl) {
				return;
			}
			handleIncomingURL(incomingUrl);
			previousIntentUrl = incomingUrl;
		}
	}, [incomingUrl, composeIntent, verifyEmailIntent]);
}

export function useComposeIntent() {
	const closeAllActiveElements = useCloseAllActiveElements();
	const { openComposer } = useComposerControls();
	const { hasSession } = useSession();

	return React.useCallback(
		({
			text,
			imageUrisStr,
			videoUri,
		}: {
			text: string | null;
			imageUrisStr: string | null;
			videoUri: string | null;
		}) => {
			if (!hasSession) return;

			closeAllActiveElements();

			// Whenever a video URI is present, we don't support adding images right now.
			if (videoUri) {
				const [uri, width, height] = videoUri.split("|");
				openComposer({
					text: text ?? undefined,
					videoUri: { uri, width: Number(width), height: Number(height) },
				});
				return;
			}

			const imageUris = imageUrisStr
				?.split(",")
				.filter((part) => {
					// For some security, we're going to filter out any image uri that is external. We don't want someone to
					// be able to provide some link like "bluesky://intent/compose?imageUris=https://IHaveYourIpNow.com/image.jpeg
					// and we load that image
					if (part.includes("https://") || part.includes("http://")) {
						return false;
					}
					// We also should just filter out cases that don't have all the info we need
					return VALID_IMAGE_REGEX.test(part);
				})
				.map((part) => {
					const [uri, width, height] = part.split("|");
					return { uri, width: Number(width), height: Number(height) };
				});

			setTimeout(() => {
				openComposer({
					text: text ?? undefined,
					imageUris: undefined,
				});
			}, 500);
		},
		[hasSession, closeAllActiveElements, openComposer],
	);
}

function useVerifyEmailIntent() {
	const closeAllActiveElements = useCloseAllActiveElements();
	const { verifyEmailDialogControl: control, setVerifyEmailState: setState } = useIntentDialogs();
	return React.useCallback(
		(code: string) => {
			closeAllActiveElements();
			setState({
				code,
			});
			setTimeout(() => {
				control.open();
			}, 1000);
		},
		[closeAllActiveElements, control, setState],
	);
}
