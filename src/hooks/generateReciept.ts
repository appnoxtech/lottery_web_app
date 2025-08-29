// import { useState } from "react";
// import * as Print from "expo-print";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import { Alert, Platform } from "react-native";
// import { showToast } from "../utils/toast.util";

// const useGeneratePdf = () => {
//   const generatePdf = async (htmlContent: string) => {
//     try {
//       // Generate PDF from HTML content using Expo Print
//       const options = {
//         html: htmlContent,
//         // Add any other options for Print.printToFileAsync here.  For example:
//         // base64: false  //  (optional) Set to true to return the PDF as a base64 string instead of a URI
//       };

//       const { uri } = await Print.printToFileAsync(options);

//       // Create a more permanent location for the file
//       const pdfName = `lottery_ticket_${Date.now()}.pdf`;
//       const pdfDir = FileSystem.documentDirectory;
//       const pdfUri = pdfDir + pdfName;

//       // Copy the file to a more permanent location
//       await FileSystem.copyAsync({
//         from: uri,
//         to: pdfUri
//       });

//       if (Platform.OS === 'android') {
//         // For Android, we can try to use the downloads directory
//         try {
//           // Get the downloads directory
//           const downloadDir = FileSystem.cacheDirectory + 'downloads/';

//           // Ensure the downloads directory exists
//           const dirInfo = await FileSystem.getInfoAsync(downloadDir);
//           if (!dirInfo.exists) {
//             await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
//           }

//           // Copy the file to the downloads directory
//           const downloadPath = downloadDir + pdfName;
//           await FileSystem.copyAsync({
//             from: pdfUri,
//             to: downloadPath
//           });

//           // Show success message
//           showToast("PDF ready for download", "success");

//           // Prompt the user to save the file via sharing
//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(downloadPath, {
//               mimeType: 'application/pdf',
//               dialogTitle: 'Download PDF',
//               UTI: 'com.adobe.pdf'
//             });
//           } else {
//             showToast("Sharing is not available on your device.", "error");
//           }
//         } catch (error) {
//           console.error("Error saving to downloads:", error);
//           // Fall back to regular sharing
//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(pdfUri);
//           }
//         }
//       } else {
//         // For iOS and other platforms, use sharing with "Save to Files" option
//         if (await Sharing.isAvailableAsync()) {
//           await Sharing.shareAsync(pdfUri, {
//             mimeType: 'application/pdf',
//             dialogTitle: 'Save PDF',
//             UTI: 'com.adobe.pdf'
//           });
//           showToast("Use 'Save to Files' option to download", "success");
//         } else {
//           showToast("Sharing is not available on your device.", "error");
//         }
//       }
//     } catch (err: any) {
//       console.error("Error generating PDF:", err);
//       showToast("Some error occurred", "error");
//     }
//   };

//   return generatePdf;
// };

// export default useGeneratePdf;
