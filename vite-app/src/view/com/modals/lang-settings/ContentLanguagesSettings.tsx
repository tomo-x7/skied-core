import React from "react";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { deviceLanguageCodes } from "#/locale/deviceLocales";
import { languageName } from "#/locale/helpers";
import { useModalControls } from "#/state/modals";
import { useLanguagePrefs, useLanguagePrefsApi } from "#/state/preferences/languages";
import { LANGUAGES, LANGUAGES_MAP_CODE2 } from "../../../../locale/languages";
import { ScrollView } from "../util";
import { ConfirmLanguagesButton } from "./ConfirmLanguagesButton";
import { LanguageToggle } from "./LanguageToggle";

export const snapPoints = ["100%"];

export function Component(props: {}) {
	const { closeModal } = useModalControls();
	const langPrefs = useLanguagePrefs();
	const setLangPrefs = useLanguagePrefsApi();
	const pal = usePalette("default");
	const { isMobile } = useWebMediaQueries();
	const onPressDone = React.useCallback(() => {
		closeModal();
	}, [closeModal]);

	const languages = React.useMemo(() => {
		const langs = LANGUAGES.filter(
			(lang) => !!lang.code2.trim() && LANGUAGES_MAP_CODE2[lang.code2].code3 === lang.code3,
		);
		// sort so that device & selected languages are on top, then alphabetically
		langs.sort((a, b) => {
			//@ts-expect-error
			const hasA = langPrefs.contentLanguages.includes(a.code2) || deviceLanguageCodes.includes(a.code2);
			//@ts-expect-error
			const hasB = langPrefs.contentLanguages.includes(b.code2) || deviceLanguageCodes.includes(b.code2);
			if (hasA === hasB) return a.name.localeCompare(b.name);
			if (hasA) return -1;
			return 1;
		});
		return langs;
	}, [langPrefs]);

	const onPress = React.useCallback(
		(code2: string) => {
			setLangPrefs.toggleContentLanguage(code2);
		},
		[setLangPrefs],
	);

	return (
		<div
			style={{
				...pal.view,
				...styles.container,

				...(isMobile
					? {
							paddingTop: 20,
						}
					: {
							maxHeight: "90vh",
						}),
			}}
		>
			<Text
				style={{
					...pal.text,
					...styles.title,
				}}
			>
				Content Languages
			</Text>
			<Text
				style={{
					...pal.text,
					...styles.description,
				}}
			>
				Which languages would you like to see in your algorithmic feeds?
			</Text>
			<Text
				style={{
					...pal.textLight,
					...styles.description,
				}}
			>
				Leave them all unchecked to see any language.
			</Text>
			<ScrollView style={styles.scrollContainer}>
				{languages.map((lang) => (
					<LanguageToggle
						key={lang.code2}
						code2={lang.code2}
						langType="contentLanguages"
						name={languageName(lang, langPrefs.appLanguage)}
						onPress={() => {
							onPress(lang.code2);
						}}
					/>
				))}
				<div
					style={{
						height: isMobile ? 60 : 0,
					}}
				/>
			</ScrollView>
			<ConfirmLanguagesButton onPress={onPressDone} />
		</div>
	);
}

const styles = {
	container: {
		flex: 1,
	},
	title: {
		textAlign: "center",
		fontWeight: "600",
		fontSize: 24,
		marginBottom: 12,
	},
	description: {
		textAlign: "center",
		paddingLeft: 16,
		paddingRight: 16,
		marginBottom: 10,
	},
	scrollContainer: {
		flex: 1,
		paddingLeft: 10,
		paddingRight: 10,
	},
} satisfies Record<string, React.CSSProperties>;
