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
import AccessToken from 'twilio/lib/jwt/AccessToken';

// const {AccessToken} = require('twilio').jwt;
// const {VideoGrant} = AccessToken;
//
// // Your Twilio Account SID and Auth Token
// const accountSid = 'ACaae70ff76447aa3604d8838c9ca6016a';
// const authToken = '54162d8847be259a57f4c3dc8a807467';
// const baseUrl = 'https://video.twilio.com/v1';
//
// // Generate an access token for a participant
// function generateAccessToken(identity: string) {
//   const token = new AccessToken(accountSid, identity, authToken);
//
//   // Add video grant to the token
//   const videoGrant = new VideoGrant();
//   token.addGrant(videoGrant);
//
//   return token.toJwt();
// }
//
// // Use the generateAccessToken function to create tokens for participants
// const participant1Token = generateAccessToken('participant1');
// const participant2Token = generateAccessToken('participant2');

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

// Call the function to create a Twilio Video room

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

  // createToken(userName).then(roomSid => {
  //   if (roomSid) {
  //     // Handle success
  //     console.log('success===');
  //   } else {
  //     // Handle failure
  //   }
  // });

  // Call the function to request permissions when needed.
  useEffect(() => {
    requestCameraAndAudioPermissions().then();
  }, []);

  const _onConnectButtonPress = () => {
    twilioRef.current.connect({
      accessToken:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjLTE2OTc2OTg2ODMiLCJpc3MiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjIiwic3ViIjoiQUNhYWU3MGZmNzY0NDdhYTM2MDRkODgzOGM5Y2E2MDE2YSIsImV4cCI6MTY5NzcwMjI4MywiZ3JhbnRzIjp7ImlkZW50aXR5IjoiY2xpZW50ICIsInZpZGVvIjp7InJvb20iOiJyb29tMSJ9fX0.hPEKKipDZi0ZZhZLDmBPlyb3C4Vs9cTRCSZlycFQFJg', // Use the token for participant 1
    });

    setStatus('connecting');
  };

  const _onConnectButtonPress2 = () => {
    twilioRef.current.connect({
      accessToken:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjLTE2OTc2OTg4MjUiLCJpc3MiOiJTS2ZiZWNkYTg2ZjMxZGMxMDIzNjAwZTgxODVhMDc5NmJjIiwic3ViIjoiQUNhYWU3MGZmNzY0NDdhYTM2MDRkODgzOGM5Y2E2MDE2YSIsImV4cCI6MTY5NzcwMjQyNSwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiY2xpZW50MiIsInZpZGVvIjp7InJvb20iOiJyb29tMSJ9fX0.rV6V6sEUFHOVWC-n1pEZQRvdxDU7i6PpZQp3RdkjQOM', // Use the token for participant 1
    });

    setStatus('connecting');
  };

  // Substitute your Twilio AccountSid and API Key details
  const ACCOUNT_SID = 'ACaae70ff76447aa3604d8838c9ca6016a';
  const API_KEY_SID = 'SKf53f8039a45a382f463f74ce51eead09';
  const API_KEY_SECRET = 'W9HvAgiUxqzoph6IEqLmSKeOe2xKu1O6';

  // Function to generate a Twilio access token for a specific room
  // const generateTwilioAccessToken = (identity, roomName) => {
  //   // Create an Access Token
  //   const accessToken = new AccessToken(
  //     ACCOUNT_SID,
  //     API_KEY_SID,
  //     API_KEY_SECRET,
  //     {},
  //   );
  //
  //   // Set the Identity of this token
  //   accessToken.identity = identity;
  //
  //   // Grant access to Video
  //   const grant = new VideoGrant();
  //   grant.room = roomName;
  //   accessToken.addGrant(grant);
  //
  //   // Serialize the token as a JWT
  //   return accessToken.toJwt();
  // };

  // Example usage:
  const identity = 'example-user'; // Replace with the user's identity
  const roomName = 'cool room'; // Replace with the desired room name

  //const tokenData = generateTwilioAccessToken(identity, roomName);
  //console.log(tokenData, 'data');

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
