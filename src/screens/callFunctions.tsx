import {firebase} from '@react-native-firebase/firestore';
import {getToken} from '../VideoCallScreen';

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
    console.log('Call data deleted successfully!');
  } catch (error) {
    console.error('Error deleting call data: ', error);
  }
};

//-------------------------------------------------------------------//

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
  } catch (error) {
    console.error('Error updating call status: ', error);
  }
};

//-------------------------------------------------------------------//

export const putCallDataFirestore = async (
  selfUid: string,
  friendUid: string,
) => {
  const roomName = 'room-' + selfUid + '-' + friendUid;

  const tokenForFriend = await getToken(roomName, friendUid);
  console.log(tokenForFriend, '===tokenForFriend===');
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
  await collectionRef
    .set(sendData)
    .then(() => {
      console.log('Data added successfully!');
    })
    .catch(error => {
      console.error('Error adding data: ', error);
    });
};

//-------------------------------------------------------------------//
