import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, TouchableOpacity, View} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/Feather';
import ROUTE_NAME from './navigation/navigation-constants';
import AudioMsgComponent from './components/audio-msg/audio-msg.component';
import {presetBase} from './utils/color';
import SendVideoComponent from './components/send-video/send-video.component';
import VideoPlayerComponent from './components/video-player/video-player.component';
import RecordAudioComponent from './components/record-audio/record-audio.component';
import {useAuth} from './AuthProvider';
import {
  deleteFirestoreCallData,
  ICallData,
  setCallingData,
  updateCallDataFirestore,
} from './audio-call/CallFunctions';
import database from '@react-native-firebase/database';

const ChatScreen = ({navigation}: any) => {
  const sampleuri1 = 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4';
  const sampleuri2 = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';
  const showVideoSendComponent = true;
  const [videoUrl, setVideoUrl] = useState<string>(sampleuri1);

  const {
    user: {selfUid, chat_id, friendUid},
  } = useAuth();

  const navigateToSettings = () => {
    navigation.navigate(ROUTE_NAME.SETTINGS_SCREEN);
  };
  const navigateToSendVideo = () => {
    navigation.navigate(ROUTE_NAME.VIDEO_TRIM_SCREEN);
  };

  const navigateToVideoCall = () => {
    navigation.navigate(ROUTE_NAME.VIDEO_CALL_SCREEN);
  };

  const navigateToFullscreenVideo = () => {
    navigation.navigate(ROUTE_NAME.VIDEO_FULL_SCREEN, {
      videoData: {uri: videoUrl},
    });
  };

  const showAnotherCallAlert = (anotherPersonCallingData: any) => {
    Alert.alert(
      'Incoming call from :' + anotherPersonCallingData.caller_uid,
      'Recipient_uid: ' +
        anotherPersonCallingData.recipient_uid +
        '\n\n\nWarning: Initiating a new call will seamlessly hang up any ongoing call!',
      [
        {
          text: 'Accept',
          onPress: async () => {
            //navigation.navigate(ROUTE_NAME.CHAT_SCREEN);
            //navigation.pop(2);
            navigation.goBack();
            navigation.goBack();
            updateCallDataFirestore(
              chat_id,
              anotherPersonCallingData.recipient_uid,
              anotherPersonCallingData.caller_uid,
            );

            navigation.push(ROUTE_NAME.VIDEO_CALL_DETAIL, {
              isCalling: false,
              caller_uid: anotherPersonCallingData.caller_uid,
              recipient_uid: anotherPersonCallingData.recipient_uid,
              accessToken: anotherPersonCallingData.tokenToJoinRoom,
            });
          },
        },
        {
          text: 'reject',
          onPress: async () => {
            await deleteFirestoreCallData(
              chat_id,
              anotherPersonCallingData.recipient_uid,
              anotherPersonCallingData.caller_uid,
            );
          },
        },
      ],
    );
  };

  useEffect(() => {
    const databaseRef = database().ref(
      `chat/${chat_id}/watchers/${selfUid}/incoming-call/caller`,
    );

    const isInCallRef = database().ref(
      `users/${selfUid}/watchers/incoming-call/caller/isInCall/inCall`,
    );

    // Handle real-time updates here
    const onValueChange = databaseRef.on('value', async snapshot => {
      const newData = snapshot.val();
      const isInCallAlreadyData = await isInCallRef.once('value');
      const isInCallAlreadyFlag = isInCallAlreadyData?._snapshot?.value;

      console.log(isInCallAlreadyFlag, '--isInCallAlready-Flag--');
      console.log(JSON.stringify(newData), '---new data from RTDB---');

      const currentTime = new Date().getTime();
      const callData = Object.values(newData)[0] as ICallData;
      console.log(
        JSON.stringify(callData),
        '---incomingCallData to be interacted---',
      );

      for (const key1 of Object.keys(newData).filter(
        key => currentTime - newData[key].callTime > 60 * 1000,
      )) {
        await deleteFirestoreCallData(
          chat_id,
          newData[key1].recipient_uid,
          newData[key1].caller_uid,
        );
      }

      if (callData.callStatus === 'calling' && !isInCallAlreadyFlag) {
        console.log(
          JSON.stringify(callData),
          '---incomingCallData to be interacted---',
        );
        navigation.navigate('IncomingCall', {data: callData});
      }

      //run when getting incoming call but user is already in another call
      if (isInCallAlreadyFlag && callData.callStatus === 'calling') {
        console.log('**another incoming call**');
        console.log('--anotherPersonCallingData--', callData);

        showAnotherCallAlert(callData);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      databaseRef.off('value', onValueChange);
    };
  }, []); // Empty dependency array means this effect runs only on mount and unmount

  const makeCallRequest = async () => {
    await setCallingData(chat_id, selfUid, friendUid);
    navigation.navigate(ROUTE_NAME.VIDEO_CALL_OUTGOING, {
      caller_uid: selfUid,
      recipient_uid: friendUid,
    });
  };

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: presetBase.colors.blueSmoothLight,
        }}>
        <TouchableOpacity
          style={{
            borderRadius: 100,
            padding: 5,
            backgroundColor: presetBase.colors.grey20,
          }}
          onPress={navigateToSettings}>
          <AntDesignIcons name={'settings'} size={40} color={'purple'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderRadius: 100,
            padding: 5,
            backgroundColor: presetBase.colors.grey20,
          }}
          onPress={() => makeCallRequest()}>
          <AntDesignIcons name={'phone-call'} size={40} color={'purple'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderRadius: 100,
            padding: 5,
            backgroundColor: presetBase.colors.grey20,
          }}
          onPress={navigateToVideoCall}>
          <AntDesignIcons name={'video'} size={40} color={'purple'} />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1}}>
        <ScrollView
          style={{
            padding: 10,
            backgroundColor: 'white',
          }}>
          <AudioMsgComponent
            navigation={navigation}
            soundUrl={
              'https://d14egp0a1bks93.cloudfront.net/app/sample_billie_voice.mp3'
            }
            soundDuration={3.997}
          />
          <AudioMsgComponent
            navigation={navigation}
            soundUrl={
              'https://cdn.pixabay.com/audio/2022/03/27/audio_f4c93b2977.mp3'
            }
            soundDuration={37}
          />
          <AudioMsgComponent
            navigation={navigation}
            soundUrl={
              'https://cdn.pixabay.com/audio/2023/05/06/audio_76f30e097d.mp3'
            }
            soundDuration={9.66}
          />
          <AudioMsgComponent
            navigation={navigation}
            soundUrl={
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            }
            soundDuration={372}
          />
          {videoUrl && (
            <TouchableOpacity onPress={navigateToFullscreenVideo}>
              <VideoPlayerComponent url={videoUrl} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
      <View
        style={{
          height: 80,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 0.2,
        }}>
        {showVideoSendComponent && (
          <SendVideoComponent onSendVideo={url => setVideoUrl(url)} />
        )}
        {!showVideoSendComponent && <RecordAudioComponent />}
      </View>
    </View>
  );
};
export default ChatScreen;
