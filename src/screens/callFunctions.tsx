import {firebase} from '@react-native-firebase/firestore';
import axios from 'axios';
import {Alert} from 'react-native';

// Get a reference to the Firestore database
const db = firebase.firestore();

export const deleteFirestoreCallData = async (
  recipient_uid: string,
  caller_uid: string,
) => {
  const collectionRef = db
    .collection('users')
    .doc(recipient_uid)
    .collection('watchers')
    .doc('incoming-call')
    .collection('calls')
    .doc(caller_uid);

  const collectionRef2 = db
    .collection('users')
    .doc(caller_uid)
    .collection('watchers')
    .doc('incoming-call')
    .collection('calls')
    .doc(recipient_uid);

  try {
    await collectionRef.delete();
    await collectionRef2.delete();

    await updateAlreadyInCallStatus(recipient_uid, false);
    await updateAlreadyInCallStatus(caller_uid, false);
    console.log('Call data deleted successfully!');
  } catch (error) {
    console.error('Error deleting call data: ', error);
  }
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
      //Alert.alert('ok');
    })
    .catch((error: any) => {
      console.log(error);
      Alert.alert('error', String(error));
      return null;
    });
};

export const updateCallDataFirestore = async (
  status: string,
  recipient_uid: string,
  caller_uid: string,
) => {
  const updateData = {
    callStatus: status, // Replace 'updatedStatus' with the new call status value
    callConnectedTime: new Date().getTime(),
  };

  const collectionRef = db
    .collection('users')
    .doc(recipient_uid)
    .collection('watchers')
    .doc('incoming-call')
    .collection('calls')
    .doc(caller_uid);

  try {
    await collectionRef.update(updateData);
    console.log('Call status updated successfully!');

    await updateAlreadyInCallStatus(recipient_uid, true);
    await updateAlreadyInCallStatus(caller_uid, true);
  } catch (error) {
    console.error('Error updating call status: ', error);
  }
};

export const putCallingDataFirestore = async (
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
    const collectionRef = db
      .collection('users')
      .doc(friendUid)
      .collection('watchers')
      .doc('incoming-call')
      .collection('calls')
      .doc(selfUid); // caller uid

    // Add data to the document within the collection
    await collectionRef.set(sendData);
    console.log('call Data added successfully!');
  } catch (error) {
    console.error('Error adding call data: ', error);
  }
};

export const updateAlreadyInCallStatus = async (
  recipient_uid: string,
  inCallFlag: boolean,
) => {
  const sendData = {inCall: inCallFlag}; // Define the data you want to add

  // Reference to the collection
  const collectionRef = db
    .collection('users')
    .doc(recipient_uid)
    .collection('watchers')
    .doc('incoming-call')
    .collection('calls')
    .doc('isInCall'); // caller uid

  // Add data to the document within the collection
  await collectionRef
    .set(sendData)
    .then(() => {
      console.log('Data added successfully!');
    })
    .catch(error => {
      console.error('Error adding data: ', error);
    });
};
