/// <reference lib="dom" />

// import type { Image as RNImage } from "react-native-image-crop-picker";
type RNImage = any;

// export { openPicker } from "./picker.shared";
import { unstable__openModal } from "#/state/modals";
import type { CropperOptions } from "./types";

// export async function openCamera(_opts: CameraOpts): Promise<RNImage> {
// 	// const mediaType = opts.mediaType || 'photo' TODO
// 	throw new Error("TODO");
// }

export function openCropper(opts: CropperOptions): Promise<RNImage> {
	// TODO handle more opts
	return new Promise((resolve, reject) => {
		unstable__openModal({
			name: "crop-image",
			uri: opts.path,
			dimensions: opts.width && opts.height ? { width: opts.width, height: opts.height } : undefined,
			aspect: opts.webAspectRatio,
			circular: opts.webCircularCrop,
			onSelect: (img?: RNImage) => {
				if (img) {
					resolve(img);
				} else {
					reject(new Error("Canceled"));
				}
			},
		});
	});
}
