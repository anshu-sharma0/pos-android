import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export const exportCSVFile = async (
  headers: { [key: string]: string },
  items: { [key: string]: string }[],
  fileTitle: string
) => {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  const jsonObject = JSON.stringify(items);
  const csv = convertToCSV(jsonObject);
  const exportedFilename = fileTitle + ".csv" || "export.csv";

  if (Platform.OS === 'web') {
    // Web-specific download logic
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', exportedFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Mobile-specific download logic
    const fileUri = FileSystem.documentDirectory + exportedFilename;

    // Save the CSV to the device
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const asset = await MediaLibrary.createAssetAsync(fileUri);
    const album = await MediaLibrary.getAlbumAsync('Download');
    if (album == null) {
      await MediaLibrary.createAlbumAsync('Download', asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }

    console.log(`CSV file saved to: ${fileUri}`);
  }
};

const convertToCSV = (jsonObject) => {
  const array = typeof jsonObject !== 'object' ? JSON.parse(jsonObject) : jsonObject;
  let str = '';

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in array[i]) {
      if (line !== '') line += ',';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
};
