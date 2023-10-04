import React, {useState} from 'react';
import {Alert, Button, View} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {chatData} from './utils/utils';

const ChatExportToPDF = () => {
  const showChatBubble = true;
  const showImage = true;
  const showAudio = true;
  const [pdfFilePath, setPdfFilePath] = useState('');
  const [pdfFileHTML, setPdfFileHTML] = useState('');
  const pageBreak = '<div style="page-break-before: always;"></div>';

  const imageHTML =
    '<div style="text-align: center; margin-top: 30%"><img src="https://i.ibb.co/5Fm2JLz/icon-rounded-1024.png" alt="icon-rounded-256" height="256" width="256" /></div>';

  const generatePDF = async () => {
    try {
      const chatHTML = generateChatHTML(); // Convert chat data to HTML

      const pdfOptions = {
        html: chatHTML,
        fileName: 'chat_export.pdf',
        directory: 'Downloads',
      };
      const pdf = await RNHTMLtoPDF.convert(pdfOptions); // Generate PDF from HTML
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

    // Format the time difference in date-time format
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    } as Intl.DateTimeFormatOptions;
    const formattedTimestamp1 = timestamp1.toLocaleDateString('en-US', options);
    const formattedTimestamp2 = timestamp2.toLocaleDateString('en-US', options);

    const formattedTimeDifference = `${formattedTimestamp2}`;

    const textMsg = timeDifferenceHours < 24 ? '' : formattedTimeDifference;

    return {timeDifferenceHours, formattedTimeDifference, textMsg};
  };

  const formatTimestampToHourMinuteAMPM = (
    timestamp: string | number | Date,
  ) => {
    const date = new Date(timestamp);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour format to 12-hour format
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    // Ensure minutes are displayed with a leading zero if less than 10
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Construct the formatted time string
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const generateChatHTML = () => {
    const mergedChatData: {senderClass: string; html: string}[] = []; // Array to store merged chat messages
    let currentMessage: {senderClass: any; html: any} | null = null; // The currently merged message

    chatData.forEach(message => {
      const timeFormatted = formatTimestampToHourMinuteAMPM(message.timestamp);
      const senderClass = message.self ? 'self' : 'other'; // Define senderClass within the loop
      const messageContentHTML = `
      <p>${message.text}</p>
      ${
        message.image && showImage
          ? `<img src="${message.image}" alt="Image" width="100" height="100" />`
          : ''
      }
      ${message.audio && showAudio ? '<p>**AUDIO**</p>' : ''}`;

      if (currentMessage && currentMessage.senderClass === senderClass) {
        // Merge with the previous message if it's from the same sender
        currentMessage.html += messageContentHTML;
      } else {
        // Start a new merged message
        currentMessage = {
          senderClass,
          html: `<p style="font-size: 10px; color: dimgray"><strong style="font-size: 15px; color: black">${message.sender} · </strong>${timeFormatted}</p>
                 ${messageContentHTML}`,
        };
        mergedChatData.push(currentMessage);
      }
    });

    const chatMessagesHTML = mergedChatData
      .map((mergedMessage, index) => {
        const {senderClass, html} = mergedMessage;

        const {textMsg, timeDifferenceHours} = calculateTimeDifference(
          index,
          chatData,
        );

        const messageWhenTimeDifferenceGreaterThan24Hrs = `<div style="margin-bottom: 10px; text-align: center;">
                 <p><strong>${textMsg}</strong></p></div>`;

        const alignSelf = senderClass === 'self' ? 'flex-end' : 'flex-end'; // Determine alignSelf
        return `<div class="chat-bubble-container" style="align-self: ${alignSelf};">
                    <div class="chat-bubble ${senderClass}">${html}</div>
                </div>
               ${
                 timeDifferenceHours > 24
                   ? messageWhenTimeDifferenceGreaterThan24Hrs
                   : ''
               }`;
      })
      .join('');

    // Add the title with center alignment
    const titleHTML = `<div style="text-align: center;">
    <h1>Alice & Bob</h1>
    <h1>Friends since 29-01-2023</h1>
  </div>`;

    // Combine the title and chat messages
    const htmlData = `<html lang="">
    <head>
      <style>
        .chat-bubble-container {
          display: flex;
          margin-bottom: 10px;
          
        }
        .chat-bubble {
          max-width: 80%;
          padding: 10px;
          border-radius: 20px;
          align-self: flex-end;
        }
        .self {
          background-color: ${showChatBubble ? '#0096FF' : '#ffff'};
          text-align: left;
        }
        .other {
          background-color: ${showChatBubble ? '#ADD8E6' : '#ffff'};
          text-align: left;
        }
      </style>
      <title></title>
    </head>
    <body>
      ${imageHTML}
      ${titleHTML}
      ${pageBreak}
      ${chatMessagesHTML}
    </body>
  </html>
`;
    setPdfFileHTML(htmlData);
    return htmlData;
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

// justify-content: ${
//   senderClass === 'self' ? 'flex-end' : 'flex-start'
// };

//<ScrollView style={{width: 360}}>
//         <RenderHtml contentWidth={360} source={{html: pdfFileHTML}} />
//       </ScrollView>
