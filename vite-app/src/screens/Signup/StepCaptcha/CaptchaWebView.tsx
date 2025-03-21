import React from "react";

const REDIRECT_HOST = new URL(window.location.href).host;

export function CaptchaWebView({
	url,
	stateParam,
	onSuccess,
	onError,
}: {
	url: string;
	stateParam: string;
	onSuccess: (code: string) => void;
	onError: (error: unknown) => void;
}) {
	React.useEffect(() => {
		const timeout = setTimeout(() => {
			onError({
				errorMessage: "User did not complete the captcha within 30 seconds",
			});
		}, 30e3);

		return () => {
			clearTimeout(timeout);
		};
	}, [onError]);

	const onLoad = React.useCallback(() => {
		const frame: HTMLIFrameElement = document.getElementById("captcha-iframe") as HTMLIFrameElement;

		try {
			const href = frame?.contentWindow?.location.href;
			if (!href) return;
			const urlp = new URL(href);

			// This shouldn't happen with CORS protections, but for good measure
			if (urlp.host !== REDIRECT_HOST) return;

			const code = urlp.searchParams.get("code");
			if (urlp.searchParams.get("state") !== stateParam || !code) {
				onError({ error: "Invalid state or code" });
				return;
			}
			onSuccess(code);
		} catch (e: unknown) {
			// We don't actually want to record an error here, because this will happen quite a bit. We will only be able to
			// get hte href of the iframe if it's on our domain, so all the hcaptcha requests will throw here, although it's
			// harmless. Our other indicators of time-to-complete and back press should be more reliable in catching issues.
		}
	}, [stateParam, onSuccess, onError]);

	return <iframe src={url} style={styles.iframe} id="captcha-iframe" onLoad={onLoad} title="captcha" />;
}

const styles = {
	iframe: {
		flex: 1,
		borderWidth: 0,
		borderRadius: 10,
		backgroundColor: "transparent",
	},
} satisfies Record<string, React.CSSProperties>;
