import React, {useState} from 'react';
import {Alert, Button, View} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {chatData} from './utils/utils';

const ChatExportToPDF = () => {
  const [pdfFilePath, setPdfFilePath] = useState('');
  const pageBreak = '<div style="page-break-before: always;"></div>';

  const generatePDF = async () => {
    try {
      const chatHTML = generateChatHTML(); // Convert chat data to HTML

      // Generate PDF from HTML
      const pdfOptions = {
        html: chatHTML,
        fileName: 'chat_export.pdf',
        directory: 'Downloads',
      };
      const pdf = await RNHTMLtoPDF.convert(pdfOptions);
      setPdfFilePath(pdf.filePath || '');

      // Optionally, you can open or share the PDF here
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const calculateTimeDifference = (index: number, chatdata: string | any[]) => {
    if (index >= chatData.length - 1) {
      // Return a default value or handle the case when there are no more messages
      return {timeDifferenceDays: 0, timeDifferenceHours: 0};
    }

    const timestamp1 = new Date(chatdata[index].timestamp);
    const timestamp2 = new Date(chatdata[index + 1].timestamp);

    // Calculate the time difference in milliseconds
    const timeDifferenceMilliseconds = Math.abs(timestamp1 - timestamp2);

    // Calculate the time difference in hours
    const timeDifferenceHours = timeDifferenceMilliseconds / (1000 * 60 * 60);

    // Calculate the time difference in days
    const timeDifferenceDays =
      timeDifferenceMilliseconds / (1000 * 60 * 60 * 24);

    const roundedTimeDifferenceHours = Math.round(timeDifferenceHours);
    const roundedTimeDifferenceDays = Math.round(timeDifferenceDays);

    console.log(`Time difference in hours: ${roundedTimeDifferenceHours}`);
    console.log(`Time difference in days: ${roundedTimeDifferenceDays}`);
    const textMsg =
      timeDifferenceHours < 24
        ? roundedTimeDifferenceHours + ' hrs ago'
        : roundedTimeDifferenceDays + ' days ago';

    return {timeDifferenceHours, textMsg};
  };

  const generateChatHTML = () => {
    const chatMessagesHTML = chatData
      .map((message, index) => {
        const senderClass = message.self ? 'self' : 'other';
        let messageContentHTML = `<strong>${message.sender}:</strong><p>${message.text}</p>`;

        // Check if there's an image
        if (message.image !== null) {
          messageContentHTML += `
        <img src="${message.image}" alt="Image" width="100" height="100" />`;
        }

        // Check if there's an audio
        if (message.audio !== null) {
          messageContentHTML += '<p>**AUDIO**</p>';
        }

        // Example usage:
        const {textMsg, timeDifferenceHours} = calculateTimeDifference(
          index,
          chatData,
        );

        const isTimeDifferenceGreaterThan2 = timeDifferenceHours > 2;

        const messageWhenTimeDifferenceGreaterThan2 = `<div style="margin-bottom: 10px; text-align: center;">
                 <p><strong>${textMsg}</strong></p></div>`;

        return `<div>
                   <div class="${senderClass}">${messageContentHTML}</div>
                     ${
                       isTimeDifferenceGreaterThan2
                         ? messageWhenTimeDifferenceGreaterThan2
                         : ''
                     }
                </div>`;
      })
      .join('');

    const imageHTML =
      '<div style="text-align: center;"><img src="https://i.ibb.co/5Fm2JLz/icon-rounded-1024.png" alt="icon-rounded-1024" height="512" width="512" /></div>';

    // Add the title with center alignment
    const titleHTML = `<div style="text-align: center;">
      <h1>Alice & Bob</h1>
      <h1>Friends since 29-01-2023</h1>
    </div>`;

    // Combine the title and chat messages
    return `<html lang="">
      <head>
        <style>
          .self {
            background-color: #DCF8C6;
            text-align: right;
            padding: 20px; 
            border-radius: 20px;
            margin-bottom: 10px; 
          }
          .other {
            background-color: #EFEFEF;
            padding: 20px; 
            border-radius: 20px;
            margin-bottom: 10px;
          }
        </style><title></title>
      </head>
      <body>
        ${imageHTML}
        ${titleHTML}
        ${pageBreak}
        ${chatMessagesHTML}
      </body>
    </html>
  `;
  };

  const downloadPDF = async () => {
    try {
      if (pdfFilePath) {
        const sourcePath = pdfFilePath; // Define the source and destination paths for the download
        const destPath = RNFS.DownloadDirectoryPath + '/chat_export.pdf';
        await RNFS.copyFile(sourcePath, destPath); // Copy the PDF file to the desired download location

        Alert.alert('PDF downloaded', 'saved to path: ' + destPath); // Provide feedback to the user or open the PDF using an external app
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <View>
      <Button title="Export to PDF" onPress={generatePDF} />
      {pdfFilePath && <Button title="Download PDF" onPress={downloadPDF} />}
    </View>
  );
};

export default ChatExportToPDF;
