import React from 'react';
import {Text, View} from 'react-native';
import AudioMsgComponent from './components/audio-msg/audio-msg.component';

const ChatScreen = ({navigation}: any) => {
  return (
    <View style={{flex: 1, padding: 10, backgroundColor: 'white'}}>
      <View style={{}}>
        <Text
          style={{
            padding: 12,
            fontSize: 20,
            color: 'black',
            backgroundColor: 'white',
          }}
        />
      </View>
      <AudioMsgComponent
        navigation={navigation}
        soundUrl={
          'https://d14egp0a1bks93.cloudfront.net/app/sample_billie_voice.mp3'
        }
        soundDuration={4}
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
        soundDuration={9}
      />
      <AudioMsgComponent
        navigation={navigation}
        soundUrl={
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        }
        soundDuration={372}
      />
    </View>
  );
};

export default ChatScreen;
