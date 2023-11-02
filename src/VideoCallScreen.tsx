import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {presetBase} from './utils/color';
import {encode} from 'base-64';

import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import firestore, {firebase} from '@react-native-firebase/firestore';
import {useAuth} from './AuthProvider';

const createToken = async (userName: string) => {
  const accountSid = 'ACaae70ff76447aa3604d8838c9ca6016a';
  const authToken = '54162d8847be259a57f4c3dc8a807467';
  const baseUrl = 'https://video.twilio.com/v1';

  try {
    // Authenticate with Twilio
    const authHeader = 'Basic ' + encode(`${accountSid}:${authToken}`);

    const headers = {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Create the room
    const roomData = {
      StatusCallback: 'https://example.org',
      Type: 'peer-to-peer',
      UniqueName: 'SalesMeeting',
    };

    const response = await axios.get(
      `${baseUrl}/getToken?userName=${userName}`,
    );

    if (response.status === 201) {
      console.log('Twilio Video room created. SID:', response.data.sid);
      return response.data.sid;
    } else {
      console.error('Failed to create Twilio Video room:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating Twilio Video room:', error);
    return null;
  }
};

const createTwilioVideoRoom = async () => {
  const accountSid = 'ACaae70ff76447aa3604d8838c9ca6016a';
  const authToken = '54162d8847be259a57f4c3dc8a807467';
  const baseUrl = 'https://video.twilio.com/v1';
  try {
    // Authenticate with Twilio
    const authHeader = 'Basic ' + encode(`${accountSid}:${authToken}`);
    console.log(authHeader, 'authheader');
    const headers = {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Create the room
    const roomData = {
      StatusCallback: 'https://example.org',
      Type: 'peer-to-peer',
      UniqueName: 'SalesMeeting',
    };

    const response = await axios.post(`${baseUrl}/Rooms`, roomData, {headers});

    if (response.status === 201) {
      console.log('Twilio Video room created. SID:', response.data.sid);
      return response.data.sid;
    } else {
      console.error('Failed to create Twilio Video room:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating Twilio Video room:', error);
    return null;
  }
};

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
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState(new Map());
  const [videoTracks, setVideoTracks] = useState(new Map());
  console.log(videoTracks, '===');
  const [token, setToken] = useState(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjLTE2OTY1MDcxMzkiLCJpc3MiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjIiwic3ViIjoiQUNhYWU3MGZmNzY0NDdhYTM2MDRkODgzOGM5Y2E2MDE2YSIsImV4cCI6MTY5NjUxMDczOSwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiY2xpZW50SWQxIiwidmlkZW8iOnsicm9vbSI6InJvb20ifX19.uHXpC-OZ0hIOBYz7q4cw1nJedntodEbeqSBCWUYCMXA',
  );
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

  const [data, setData] = useState('');

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
      console.log(snapshot, 'snapshot');

      setData(snapshot);
      if (
        snapshot?._data?.to === uid &&
        snapshot?._data?.callStatus === 'calling'
      ) {
        Alert.alert(snapshot._data.to + ' calling you', '', [
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
  console.log(data?._data?.caller, '---data---');

  const putFirestore = async () => {
    // Get a reference to the Firestore database
    const db = firebase.firestore();

    // Define the data you want to add
    const sendData = {
      caller: 'calling murari',
      to: friendUid,
      callTime: new Date(),
      callStatus: 'calling',
      tokenToJoinRoom: 'token',
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
  const _onConnectButtonPress = async () => {
    const uid = auth.user.email === 'fitmurari@gmail.com' ? 'murari' : 'akram';
    console.log(uid, '----uid----');
    await putFirestore(uid);
    // twilioRef.current.connect({
    //   accessToken:
    //     'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjLTE2OTc2OTg2ODMiLCJpc3MiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjIiwic3ViIjoiQUNhYWU3MGZmNzY0NDdhYTM2MDRkODgzOGM5Y2E2MDE2YSIsImV4cCI6MTY5NzcwMjI4MywiZ3JhbnRzIjp7ImlkZW50aXR5IjoiY2xpZW50ICIsInZpZGVvIjp7InJvb20iOiJyb29tMSJ9fX0.hPEKKipDZi0ZZhZLDmBPlyb3C4Vs9cTRCSZlycFQFJg', // Use the token for participant 1
    // });
    //
    // setStatus('connecting');
  };

  const _onConnectButtonPress2 = async () => {
    await putFirestore('murari');

    // twilioRef.current.connect({
    //   accessToken:
    //     'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjLTE2OTc3MTU4NzMiLCJpc3MiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjIiwic3ViIjoiQUNhYWU3MGZmNzY0NDdhYTM2MDRkODgzOGM5Y2E2MDE2YSIsImV4cCI6MTY5NzcxOTQ3MywiZ3JhbnRzIjp7ImlkZW50aXR5IjoiY2xpZW50MiIsInZpZGVvIjp7InJvb20iOiJyb29tMSJ9fX0.9E6WDu7xSGwrdRpmO0K9xL4ikhsui4XNnaTJ6uebDoU', // Use the token for participant 1
    // });
    //
    // setStatus('connecting');
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

  const _onEndButtonPress = () => {
    twilioRef.current.disconnect();
  };

  const _onMuteButtonPress = () => {
    twilioRef.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(isEnabled => setIsAudioEnabled(isEnabled));
  };

  const _onFlipButtonPress = () => {
    twilioRef.current.flipCamera();
  };

  const _onRoomDidConnect = ({roomName, error}) => {
    console.log('onRoomDidConnect: ', roomName);

    setStatus('connected');
  };

  const _onRoomDidDisconnect = ({roomName, error}) => {
    console.log('[Disconnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const _onRoomDidFailToConnect = error => {
    console.log('[FailToConnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const _onParticipantAddedVideoTrack = ({participant, track}) => {
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

  const _onParticipantRemovedVideoTrack = ({participant, track}) => {
    console.log('onParticipantRemovedVideoTrack: ', participant, track);

    const videoTracksLocal = videoTracks;
    videoTracksLocal.delete(track.trackSid);

    setVideoTracks(videoTracksLocal);
  };

  return (
    <View style={styles.container}>
      {status === 'disconnected' && (
        <View>
          <Text style={styles.welcome}>React Native Twilio Video</Text>
          <Text style={styles.welcome}>{data?._data?.to}</Text>
          <TextInput
            style={{borderWidth: 1}}
            autoCapitalize="none"
            value={token}
            onChangeText={text => setToken(text)}
          />
          <TextInput
            style={{borderWidth: 1}}
            autoCapitalize="none"
            value={token}
            onChangeText={text => setUserName(text)}
          />
          <Button
            title="Connect"
            style={styles.button}
            onPress={_onConnectButtonPress}
          />
          <Button
            title="Connect2"
            style={styles.button}
            onPress={_onConnectButtonPress2}
          />
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
                    enabled={true}
                    style={styles.localVideo}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onFlipButtonPress}>
              <MaterialCommunityIcons
                name={'camera-flip'}
                size={24}
                color={'white'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onMuteButtonPress}>
              <AntDesignIcons
                name={isAudioEnabled ? 'mic' : 'mic-off'}
                size={24}
                color={'white'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => {}}>
              <AntDesignIcons
                name={isAudioEnabled ? 'videocam' : 'videocam-off'}
                size={24}
                color={'white'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.EndButton}
              onPress={_onEndButtonPress}>
              <AntDesignIcons name={'call'} size={24} color={'white'} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TwilioVideo
        ref={twilioRef}
        onRoomDidConnect={_onRoomDidConnect}
        onRoomDidDisconnect={_onRoomDidDisconnect}
        onRoomDidFailToConnect={_onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
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
