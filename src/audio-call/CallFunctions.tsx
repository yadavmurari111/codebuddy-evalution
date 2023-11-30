import axios from 'axios';
import Sound from 'react-native-sound';
import callHangup from './call-assets/call-hang-up.mp3';
import outgoingCallRingtone from './call-assets/call-ringtone.mp3';
import incomingCallRingtone from './call-assets/ringtone.mp3';

import database from '@react-native-firebase/database';

const CallHangup = new Sound(callHangup);
const OutgoingCallRingtone = new Sound(outgoingCallRingtone);
const IncomingCallRingtone = new Sound(incomingCallRingtone);

export const callEndedSoundPlay = () => {
  CallHangup.play(() => console.log('call ended sound played!'));
};

export const OutgoingCallRingtonePlay = () => {
  OutgoingCallRingtone.play(() => console.log('callRingtonePlayed'));
};

export const OutgoingCallRingtoneStop = () => {
  OutgoingCallRingtone.stop(() => console.log('call ringtone stopped'));
};

export const IncomingCallRingtonePlay = () => {
  IncomingCallRingtone.play(() => console.log('callRingtonePlayed'));
};

export const IncomingCallRingtoneStop = () => {
  IncomingCallRingtone.stop(() => console.log('IncomingCall Ringtone stopped'));
};

export interface ICallData {
  caller_uid: string;
  recipient_uid: string;
  callStatus: string;
  roomName: string;
  tokenToJoinRoom: string;
  callTime: number;
  callConnectedTime: number;
  isCallerMute: boolean;
  isRecipientMute: boolean;
}

export type ICallDataObject = {
  [key: string]: ICallData;
};

export const getToken = async (roomName: string, identityName: string) => {
  const requestData = {roomName, identityName};
  const headers = {'Content-Type': 'application/json'};

  //http://192.168.29.244:5000/join-room
  return await axios
    .post('http://192.168.29.244:5000/join-room', requestData, {headers})
    .then((response: {data: any}) => {
      if (response.data) {
        console.log(JSON.stringify(response.data.token));
        return response?.data.token;
      }
    })
    .catch((error: any) => {
      console.log(error);
      return null;
    });
};

const onComplete = (onCompleteData: Error | null) => {
  console.log('onCompleteData: ', onCompleteData);
};

export const deleteFirestoreCallData = (
  chat_id: string,
  recipient_uid: string,
  caller_uid: string,
) => {
  const collectionRef = database().ref(
    `chat/${chat_id}/watchers/${recipient_uid}/incoming-call/caller/${caller_uid}`,
  );

  try {
    collectionRef
      .remove()
      .then(() => console.log('Call data deleted successfully!'))
      .catch(error => console.error('Error deleting call data: ', error));

    updateAlreadyInCallStatus(recipient_uid, false);
    updateAlreadyInCallStatus(caller_uid, false);
    console.log('Call data deleted successfully!');
  } catch (error) {
    console.error('Error deleting call data: ', error);
  }
};

export const updateCallDataFirestore = (
  chat_id: string,
  recipient_uid: string,
  caller_uid: string,
) => {
  const updateData = {
    callStatus: 'connected', // Replace 'updatedStatus' with the new call status value
    callConnectedTime: new Date().getTime(),
  };

  const collectionRef = database().ref(
    `chat/${chat_id}/watchers/${recipient_uid}/incoming-call/caller/${caller_uid}`,
  );

  try {
    collectionRef
      .update(updateData)
      .then(() => console.log('Call status updated successfully!'))
      .catch(error => console.error('Error updating call status: ', error));

    updateAlreadyInCallStatus(recipient_uid, true);
    updateAlreadyInCallStatus(caller_uid, true);
  } catch (error) {
    console.error('Error updating call status: ', error);
  }
};

export const setCallingData = async (
  chat_id: string,
  selfUid: string,
  friendUid: string,
) => {
  try {
    const roomName = 'room-' + selfUid + '-' + friendUid;
    const tokenForFriend = await getToken(roomName, friendUid);
    console.log('===tokenForFriend===', tokenForFriend);

    // Define the data you want to add
    const sendData = {
      caller_uid: String(selfUid),
      recipient_uid: String(friendUid),
      callTime: new Date().getTime(),
      callStatus: 'calling',
      roomName: roomName,
      tokenToJoinRoom: tokenForFriend,
    };

    // Reference to the collection
    const collectionRef = database().ref(
      `chat/${chat_id}/watchers/${friendUid}/incoming-call/caller/${selfUid}`,
    );

    // Add data to the document within the collection
    collectionRef
      .set(sendData, onComplete)
      .then(() => console.log('call Data added successfully!'));
  } catch (error) {
    console.error('Error adding call data: ', error);
  }
};

export const updateAlreadyInCallStatus = (
  recipient_uid: string,
  inCallFlag: boolean,
) => {
  const sendData = {inCall: inCallFlag}; // Define the data you want to add

  const collectionRef = database().ref(
    `users/${recipient_uid}/watchers/incoming-call/caller/isInCall`,
  );

  // Add data to the document within the collection
  collectionRef
    .set(sendData)
    .then(() => {
      console.log('isInCall Data updated successfully!');
    })
    .catch(error => {
      console.error('Error adding data: ', error);
    });
};

export const updateMuteStatusToFirestore = (
  muteStatus: boolean,
  isCalling: boolean,
  chat_id: string,
  recipient_uid: string,
  caller_uid: string,
) => {
  const updateCallerMuteData = {
    isCallerMute: muteStatus,
  };
  const updateRecipientMuteData = {
    isRecipientMute: muteStatus,
  };
  const updateData = isCalling ? updateCallerMuteData : updateRecipientMuteData;

  const collectionRef = database().ref(
    `chat/${chat_id}/watchers/${recipient_uid}/incoming-call/caller/${caller_uid}`,
  );

  try {
    collectionRef
      .update(updateData)
      .then(() => {
        console.log('updated MuteStatus To Firestore successfully!');
      })
      .catch(error => {
        console.error('Error adding data: ', error);
      });
  } catch (error) {
    console.error('Error updating call status: ', error);
  }
};
