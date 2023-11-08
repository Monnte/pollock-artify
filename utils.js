import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export const shareFile = async (uri, toast) => {
	if (Sharing.isAvailableAsync()) {
		const fileUri = FileSystem.documentDirectory + uri;
		const fileInfo = await FileSystem.getInfoAsync(fileUri);
		if (!fileInfo.exists) {
			toast.show({
				description: "SVG representation of this image does not exist",
				placement: "top",
			});
			return;
		}
		await Sharing.shareAsync(fileUri);
	} else {
		toast.show({
			description: "Sharing is not available on this platform",
			placement: "top",
		});
	}
}


export const showFormatedDate = (date) => {
	const dateObj = new Date(parseInt(date));
	return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
}

export const saveImageToGallery = async (uri, toast) => {
	try {
		const { status } = await MediaLibrary.requestPermissionsAsync();
		if (status === 'granted') {
			const fileUri = FileSystem.documentDirectory + uri;
			await MediaLibrary.saveToLibraryAsync(fileUri);
			toast.show({
				description: "Saved to mobile gallery",
				placement: "top",
			});
		}
		else {
			toast.show({
				description: "Permission denied",
				placement: "top",
			});
		}
	}
	catch (e) {
		toast.show({
			description: e.message,
			placement: "top",
		});
	}
}

export const saveSvgBase64 = async (base64, date) => {
	const fileUri = FileSystem.documentDirectory + "art" + date + ".svg";
	await FileSystem.writeAsStringAsync(fileUri, base64, {
		encoding: FileSystem.EncodingType.Base64,
	});
	return fileUri;
}

export const saveImageBase64 = async (base64, date) => {
	const fileUri = FileSystem.documentDirectory + "art" + date;
	await FileSystem.writeAsStringAsync(fileUri + ".png", base64, {
		encoding: FileSystem.EncodingType.Base64,
	});
	const metadata = {
		creationTime: date,
		name: 'Untitled',
	};
	await FileSystem.writeAsStringAsync(fileUri + '.json', JSON.stringify(metadata));
	return fileUri;
}

export const getFiles = async () => {
	const images = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
	return images;
}

export const getImage = async (name) => {
	const image = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + name, {
		encoding: FileSystem.EncodingType.Base64,
	});
	return image;
}

export const getMetadata = async (name) => {
	const metadata = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + name);
	return JSON.parse(metadata);
}

export const deleteFile = async (name) => {
	const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + name);
	if (!fileInfo.exists) return;
	await FileSystem.deleteAsync(FileSystem.documentDirectory + name);
}

export const renameImage = async (name, path) => {
	const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + path);
	if (!fileInfo.exists) return;
	const jsonPath = FileSystem.documentDirectory + path.replace('.png', '.json');
	const metadata = await FileSystem.readAsStringAsync(jsonPath);
	const metadataObj = JSON.parse(metadata);
	metadataObj.name = name;
	await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(metadataObj));
}

export const deleteAllFiles = async () => {
	const images = await getFiles();
	await Promise.all(images.map(async (image) => {
		await deleteFile(image);
	}));
}