import React from 'react';
import {View} from 'react-native';
import SendVideoComponent from './components/send-video/send-video.component';

const ChatScreen = ({navigation}: any) => {
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        {/*<ScrollView style={{flex: 9, padding: 10, backgroundColor: 'white'}}>*/}
        {/*  <AudioMsgComponent*/}
        {/*    navigation={navigation}*/}
        {/*    soundUrl={*/}
        {/*      'https://d14egp0a1bks93.cloudfront.net/app/sample_billie_voice.mp3'*/}
        {/*    }*/}
        {/*    soundDuration={3.997}*/}
        {/*  />*/}
        {/*  <AudioMsgComponent*/}
        {/*    navigation={navigation}*/}
        {/*    soundUrl={*/}
        {/*      'https://cdn.pixabay.com/audio/2022/03/27/audio_f4c93b2977.mp3'*/}
        {/*    }*/}
        {/*    soundDuration={37}*/}
        {/*  />*/}
        {/*  <AudioMsgComponent*/}
        {/*    navigation={navigation}*/}
        {/*    soundUrl={*/}
        {/*      'https://cdn.pixabay.com/audio/2023/05/06/audio_76f30e097d.mp3'*/}
        {/*    }*/}
        {/*    soundDuration={9.66}*/}
        {/*  />*/}
        {/*  <AudioMsgComponent*/}
        {/*    navigation={navigation}*/}
        {/*    soundUrl={*/}
        {/*      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'*/}
        {/*    }*/}
        {/*    soundDuration={372}*/}
        {/*  />*/}
        {/*</ScrollView>*/}
      </View>
      <View
        style={{
          //flex: 1,
          height: 80,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <SendVideoComponent navigation={navigation} />
      </View>
    </View>
  );
};

export default ChatScreen;
