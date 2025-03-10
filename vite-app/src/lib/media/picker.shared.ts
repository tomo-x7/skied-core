// TODO: replace global i18n instance with one returned from useLingui -sfn
import { type ImagePickerOptions, MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";

import * as Toast from "#/view/com/util/Toast";
import { getDataUriSize } from "./util";

export async function openPicker(opts?: ImagePickerOptions) {
	const response = await launchImageLibraryAsync({
		exif: false,
		mediaTypes: MediaTypeOptions.Images,
		quality: 1,
		...opts,
		legacy: true,
	});

	if (response.assets && response.assets.length > 4) {
		Toast.show("You may only select up to 4 images", "exclamation-circle");
	}

	return (
		(response.assets ?? [])
			.slice(0, 4)
			//@ts-ignore
			.filter((asset) => {
				if (asset.mimeType?.startsWith("image/")) return true;
				Toast.show("Only image files are supported", "exclamation-circle");
				return false;
			})
			//@ts-ignore
			.map((image) => ({
				mime: image.mimeType || "image/jpeg",
				height: image.height,
				width: image.width,
				path: image.uri,
				size: getDataUriSize(image.uri),
			}))
	);
}
