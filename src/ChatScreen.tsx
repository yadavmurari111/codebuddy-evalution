import React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/Feather';
import ROUTE_NAME from './navigation/navigation-constants';
import RecordAudioComponent from './components/record-audio/record-audio.component';
import AudioMsgComponent from './components/audio-msg/audio-msg.component';

const ChatScreen = ({navigation}: any) => {
  const navigateToSettings = () => {
    navigation.navigate(ROUTE_NAME.SETTINGS_SCREEN);
  };
  const navigateToSendVideo = () => {
    navigation.navigate(ROUTE_NAME.VIDEO_TRIM_SCREEN);
  };
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <TouchableOpacity onPress={navigateToSettings}>
          <AntDesignIcons name={'settings'} size={40} color={'grey'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToSendVideo}>
          <AntDesignIcons name={'video'} size={40} color={'grey'} />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1, padding: 12}}>
        <ScrollView style={{flex: 9, padding: 10, backgroundColor: 'white'}}>
          {/*<AudioMsgComponent*/}
          {/*  navigation={navigation}*/}
          {/*  soundUrl={*/}
          {/*    'https://d14egp0a1bks93.cloudfront.net/app/sample_billie_voice.mp3'*/}
          {/*  }*/}
          {/*  soundDuration={3.997}*/}
          {/*/>*/}
          {/*<AudioMsgComponent*/}
          {/*  navigation={navigation}*/}
          {/*  soundUrl={*/}
          {/*    'https://cdn.pixabay.com/audio/2022/03/27/audio_f4c93b2977.mp3'*/}
          {/*  }*/}
          {/*  soundDuration={37}*/}
          {/*/>*/}
          {/*<AudioMsgComponent*/}
          {/*  navigation={navigation}*/}
          {/*  soundUrl={*/}
          {/*    'https://cdn.pixabay.com/audio/2023/05/06/audio_76f30e097d.mp3'*/}
          {/*  }*/}
          {/*  soundDuration={9.66}*/}
          {/*/>*/}
          {/*<AudioMsgComponent*/}
          {/*  navigation={navigation}*/}
          {/*  soundUrl={*/}
          {/*    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'*/}
          {/*  }*/}
          {/*  soundDuration={372}*/}
          {/*/>*/}
        </ScrollView>
      </View>
      <View
        style={{
          height: 300,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <RecordAudioComponent navigation={navigation} />
      </View>
    </View>
  );
};

export default ChatScreen;
