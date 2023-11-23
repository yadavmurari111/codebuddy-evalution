import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc';
import {
  Alert,
  Button,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {presetBase} from './utils/color';
import call from '../src/assets/incoming-call-assets/ringtone.mp3';

import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {firebase} from '@react-native-firebase/firestore';
import {useAuth} from './AuthProvider';
import Sound from 'react-native-sound';

interface IVideoCallScreen {
  navigation: any;
  route: any;
}

const VideoCallScreen: FunctionComponent<
  IVideoCallScreen
> = ({}: IVideoCallScreen) => {
  // Initialize Google Sign-In
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [status, setStatus] = useState('disconnected');
  const [videoTracks, setVideoTracks] = useState(new Map());
  console.log(videoTracks, '===');

  const twilioRef = useRef(null);

  const auth = useAuth();
  console.log(auth.user.email, '--auth');
  const uid = auth.user.email === 'fitmurari@gmail.com' ? 'murari' : 'akram';
  const friendUid =
    auth.user.email !== 'fitmurari@gmail.com' ? 'murari' : 'akram';

  async function requestCameraAndAudioPermissions() {
    try {
      const cameraPermission = PermissionsAndroid.PERMISSIONS.CAMERA;
      const audioPermission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

      const grantedCamera = await PermissionsAndroid.request(cameraPermission);
      const grantedAudio = await PermissionsAndroid.request(audioPermission);

      if (
        grantedCamera === PermissionsAndroid.RESULTS.GRANTED &&
        grantedAudio === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Camera and audio permissions granted');
        // You can now use the camera and audio recording features in your app.
      } else {
        console.log('Camera and audio permissions denied');
        // Handle the case where permissions are denied by the user.
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  // Call the function to request permissions when needed.
  useEffect(() => {
    requestCameraAndAudioPermissions().then();
  }, []);

  useEffect(() => {
    const db = firebase.firestore();

    const rootCollectionRef = db
      .collection('users')
      .doc(uid)
      .collection('watchers')
      .doc('incoming-call');

    // Add a real-time listener to the root collection
    const unsubscribe = rootCollectionRef.onSnapshot(snapshot => {
      // Process the changes here
      console.log(snapshot, '--snapshot data--');

      if (snapshot?._data?.callStatus === 'calling') {
        Alert.alert(snapshot._data.caller_uid + ' calling you', '', [
          {text: 'pick up', onPress: () => updateFirestore('connected')},
          {text: 'end', onPress: () => updateFirestore('disconnected')},
        ]);
      }
    });

    return () => {
      // Unsubscribe the listener when the component unmounts
      unsubscribe();
    };
  }, []);

  const putFirestore = async () => {
    // Get a reference to the Firestore database
    const db = firebase.firestore();

    const roomname = 'room';

    const tokenForFriend = await getToken(roomname, friendUid);
    console.log(tokenForFriend, '==tokenForFriend==');
    // Define the data you want to add
    const sendData = {
      caller_uid: String(uid),
      recipient_uid: String(friendUid),
      callTime: new Date().getTime(),
      callStatus: 'calling',
      roomName: roomname,
      tokenToJoinRoom: tokenForFriend,
    };

    // Reference to the collection
    const collectionRef = db
      .collection('users')
      .doc(friendUid)
      .collection('watchers')
      .doc('incoming-call');

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

  const updateFirestore = async (status: string) => {
    const db = firebase.firestore();
    const updateData = {
      callStatus: status, // Replace 'updatedStatus' with the new call status value
    };
    const collectionRef = db
      .collection('users')
      .doc(uid)
      .collection('watchers')
      .doc('incoming-call');

    try {
      await collectionRef.update(updateData);
      console.log('Call status updated successfully!');
    } catch (error) {
      console.error('Error updating call status: ', error);
    }
  };
  const onConnectButtonPress = async () => {
    // await putFirestore();
    const roomname = 'room';

    const tokenForFriend = await getToken(roomname, uid);

    twilioRef.current.connect({
      accessToken: tokenForFriend,
      enableVideo: false,
    });

    setStatus('connecting');
  };

  // Substitute your Twilio AccountSid and API Key details
  const ACCOUNT_SID = 'ACaae70ff76447aa3604d8838c9ca6016a';
  const API_KEY_SID = 'SKf53f8039a45a382f463f74ce51eead09';
  const API_KEY_SECRET = 'W9HvAgiUxqzoph6IEqLmSKeOe2xKu1O6';

  // useEffect(() => {
  //   // Define the request data as an object
  //   const requestData = {
  //     roomName: 'test-room',
  //     identityName: 'murari',
  //   };
  //
  //   // Define the headers
  //   const headers = {
  //     'Content-Type': 'application/json',
  //   };
  //
  //   axios
  //     .post('http://192.168.29.244:5000/join-room', requestData, {headers})
  //     .then((response: {data: any}) => {
  //       console.log(JSON.stringify(response.data));
  //       Alert.alert('ok');
  //     })
  //     .catch((error: any) => {
  //       console.log(error);
  //       Alert.alert('error', String(error));
  //     });
  // }, []);

  const onEndButtonPress = () => {
    twilioRef.current.disconnect();
    // updateFirestore('disconnected');
    setStatus('disconnected');
  };

  const onMuteButtonPress = () => {
    twilioRef.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(isEnabled => setIsAudioEnabled(isEnabled));
  };

  const onFlipButtonPress = () => {
    twilioRef.current.flipCamera();
  };

  const onRoomConnect = ({roomName, error}) => {
    console.log('onRoomDidConnect: ', roomName);
    Alert.alert('room connected');
    setStatus('connected');
  };

  const onRoomDisconnect = ({roomName, error}) => {
    console.log('[Disconnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const onRoomFailToConnect = error => {
    console.log('[FailToConnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const onParticipantAddedVideoTrack = ({participant, track}) => {
    console.log('onParticipantAddedVideoTrack: ', participant, track);

    setVideoTracks(
      new Map([
        ...videoTracks,
        [
          track.trackSid,
          {participantSid: participant.sid, videoTrackSid: track.trackSid},
        ],
      ]),
    );
  };

  const onParticipantRemovedVideoTrack = ({participant, track}) => {
    console.log('onParticipantRemovedVideoTrack: ', participant, track);

    const videoTracksLocal = videoTracks;
    videoTracksLocal.delete(track.trackSid);

    setVideoTracks(videoTracksLocal);
  };

  return (
    <View style={styles.container}>
      {status === 'disconnected' && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{paddingBottom: 30}}>React Native Twilio Video</Text>
          <Text style={{paddingBottom: 30}}>{status}</Text>

          <Button title="Connect" onPress={onConnectButtonPress} />
        </View>
      )}

      {(status === 'connected' || status === 'connecting') && (
        <View style={styles.callContainer}>
          <View style={{flex: 9}}>
            {status === 'connected' && (
              <View>
                <View style={styles.remoteGrid}>
                  {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                    return (
                      <TwilioVideoParticipantView
                        style={styles.remoteVideo}
                        key={trackSid}
                        trackIdentifier={trackIdentifier}
                      />
                    );
                  })}
                </View>
                <View style={{position: 'absolute', borderWidth: 2}}>
                  <TwilioVideoLocalView
                    enabled={false}
                    style={styles.localVideo}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={onFlipButtonPress}>
              <MaterialCommunityIcons
                name={'camera-flip'}
                size={24}
                color={'white'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={onMuteButtonPress}>
              <AntDesignIcons
                name={isAudioEnabled ? 'mic' : 'mic-off'}
                size={24}
                color={'white'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setIsVideoEnabled(!isVideoEnabled)}>
              <AntDesignIcons
                name={isVideoEnabled ? 'videocam' : 'videocam-off'}
                size={24}
                color={'white'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.EndButton}
              onPress={onEndButtonPress}>
              <AntDesignIcons name={'call'} size={24} color={'white'} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TwilioVideo
        ref={twilioRef}
        onRoomDidConnect={onRoomConnect}
        onRoomDidDisconnect={onRoomDisconnect}
        onRoomDidFailToConnect={onRoomFailToConnect}
        onParticipantAddedVideoTrack={onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={onParticipantRemovedVideoTrack}
      />
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  callContainer: {flex: 1, backgroundColor: 'grey', borderWidth: 4},
  remoteGrid: {
    borderWidth: 1,
  },
  remoteVideo: {
    height: '100%',
    width: '100%',
    borderWidth: 1,
  },
  optionsContainer: {
    flex: 1,
    borderTopRightRadius: 14,
    borderTopLeftRadius: 14,
    flexDirection: 'row',
    backgroundColor: 'black',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  optionButton: {
    borderWidth: 1,
    padding: 5,
    margin: 4,
    backgroundColor: presetBase.colors.blueBase,
    borderRadius: 100,
    justifyContentL: 'center',
    alignItems: 'center',
  },
  EndButton: {
    borderWidth: 1,
    padding: 5,
    margin: 4,
    backgroundColor: presetBase.colors.redOnLight,
    borderRadius: 100,
    justifyContentL: 'center',
    alignItems: 'center',
  },
  localVideo: {
    borderWidth: 1,
    height: 200,
    aspectRatio: 9 / 16,
  },
});

// const fetchToken = async () => {
//   try {
//     const res = await fetch(
//       `https://<your_base_url>/getToken?username=${username}&room=${room}`,
//     );
//     if (!res.ok) {
//       console.log('error');
//       Alert.alert('API not available');
//       return null;
//     }
//     const jwt = await res.text();
//     console.log(jwt, 'jwt');
//     return jwt;
//   } catch (error) {
//     console.log('error', error);
//     Alert.alert('An Error occurred');
//     return null;
//   }
// };
