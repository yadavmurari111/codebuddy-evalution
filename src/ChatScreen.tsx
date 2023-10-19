import React, {useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/Feather';
import ROUTE_NAME from './navigation/navigation-constants';
import AudioMsgComponent from './components/audio-msg/audio-msg.component';
import {presetBase} from './utils/color';
import SendVideoComponent from './components/send-video/send-video.component';
import VideoPlayerComponent from './components/video-player/video-player.component';
import RecordAudioComponent from './components/record-audio/record-audio.component';

const ChatScreen = ({navigation}: any) => {
  const sampleuri1 = 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4';
  const sampleuri2 = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';
  const showVideoSendComponent = true;
  const [videoUrl, setVideoUrl] = useState<string>(sampleuri1);

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
