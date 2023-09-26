import React, {FunctionComponent, useRef, useState} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AntDesignIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {presetBase} from '../../utils/color';
import {formatTime} from '../../utils/utils';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNSoundLevel, {SoundLevelResult} from 'react-native-sound-level';

const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordAudioComponent: FunctionComponent<any> = () => {
  const [waveBoxWidth, setWaveBoxWidth] = useState(0);
  const [animationWidth, setAnimationWidth] = useState(0);
  const [showRecording, setShowRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevelsArray, setAudioLevelsArray] = useState<
    {value: number; color: string}[]
  >([]);

  const newArray = audioLevelsArray.map(item => {
    return {
      value: item.value,
      color: duration > 25 ? 'red' : 'white',
    };
  });

  const onNewFrameHandler = (data: SoundLevelResult) => {
    // see "Returned data" section below
    console.log('Sound level info', data);
    console.log('duration', duration);
    const audioData = {
      value: data.value + 160, // -160db is silence level
      color: duration >= 5 ? presetBase.colors.redBase : 'white',
    };
    if (audioLevelsArray.length > 35) {
      audioLevelsArray.shift();
      audioLevelsArray.push(audioData);
    } else {
      audioLevelsArray.push(audioData);
    }
  };
  console.log('length', audioLevelsArray.length);

  const onStartRecord = async () => {
    setShowRecording(true);

    // start monitoring
    RNSoundLevel.start({monitoringInterval: 10});
    // sound levels/intensity
    RNSoundLevel.onNewFrame = data => onNewFrameHandler(data);
    // start recording
    const result = await audioRecorderPlayer.startRecorder();

    audioRecorderPlayer.addRecordBackListener(e => {
      console.log(e, 'e');
      const recordDuration = e.currentPosition / 1000; // in sec
      if (recordDuration <= 30) {
        setDuration(recordDuration);
      } else {
        onStopRecord();
      }
    });

    console.log(result, 'result');
  };

  const onCancelRecording = async () => {
    setShowRecording(false);
    setAudioLevelsArray([]);
    setDuration(0);

    await onStopRecord();
  };

  const onStopRecord = async () => {
    await RNSoundLevel.stop(); // stop audio intensity/level observation
  };

  // console.log(audioLevelsArray, '==');
  const translateX = useRef(new Animated.Value(0)).current;

  const animationConfig = {
    toValue: -5000,
    duration: (30 - duration) * 1000, // Adjust the duration as needed
    useNativeDriver: true, // Necessary for 'translateX' animation
  };

  // Define the animation
  const translateAnimation = Animated.timing(translateX, animationConfig);
  console.log(waveBoxWidth, 'waveBoxWidth');
  console.log(animationWidth, 'animationWidth');

  console.log(audioLevelsArray);

  return (
    <View style={{flex: 1, backgroundColor: 'lightgrey', margin: 5}}>
      {!showRecording && (
        <View
          style={{
            height: 100,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'white',
          }}>
          <View style={{justifyContent: 'center', width: 30}}>
            <TouchableOpacity onPress={() => onStartRecord()}>
              <FontAwesome name={'microphone'} color={'blue'} size={30} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: '75%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'lightgrey',
                width: '100%',
                height: 40,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 100,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  flex: 1,
                  marginHorizontal: 12,
                  backgroundColor: 'lightgrey',
                }}>
                <TextInput
                  placeholderTextColor={'white'}
                  placeholder={'message'}
                />
              </View>
            </View>
          </View>
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity>
              <AntDesignIcons name={'send'} color={'blue'} size={30} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showRecording && (
        <View
          style={{
            height: 100,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'white',
          }}>
          <View style={{justifyContent: 'center'}}>
            <TouchableOpacity onPress={() => onCancelRecording()}>
              <AntDesignIcons name={'delete'} color={'blue'} size={30} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: '75%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'blue',
                width: '100%',
                height: 40,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 100,
                paddingHorizontal: 7,
              }}>
              <View style={{backgroundColor: 'white', borderRadius: 100}}>
                <TouchableOpacity onPress={() => onStopRecord()}>
                  <AntDesignIcons name={'pause'} color={'blue'} size={20} />
                </TouchableOpacity>
              </View>
              <View
                onLayout={event =>
                  setWaveBoxWidth(event.nativeEvent.layout.width / 6)
                }
                style={{
                  width: '70%',
                  overflow: 'hidden',
                  height: 20,
                }}>
                <Animated.View
                  onLayout={event =>
                    setAnimationWidth(event.nativeEvent.layout.width)
                  }
                  style={{
                    flexDirection: 'row',
                    height: 20,
                    //borderWidth: 2,

                    alignItems: 'center',
                    // transform: [{translateX}],
                  }}>
                  {newArray.map((data, index) => (
                    <View
                      key={index}
                      style={{
                        width: 3,
                        borderRadius: 50,
                        marginRight: 3,
                        backgroundColor: data.color,
                        height: data.value < 110 ? 5 : data.value / 10,
                      }}
                    />
                  ))}
                </Animated.View>
              </View>
              <View>
                <Text style={{color: 'white'}}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sendButtonContainer}>
            <TouchableOpacity>
              <AntDesignIcons name={'send'} color={'blue'} size={30} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecordAudioComponent;

const styles = StyleSheet.create({
  container: {
    marginLeft: '35%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2, // Adjust this as needed to create spacing between bubbles
  },
  sendButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '700',
    padding: 12,
    backgroundColor: presetBase.colors.blueBase,
    borderRadius: 10,
  },
  animatedProgress: {
    height: 10,
    backgroundColor: 'red',
  },
});

const onStopPlay = async () => {
  console.log('onStopPlay');
  await audioRecorderPlayer.stopPlayer();
  audioRecorderPlayer.removePlayBackListener();
};
const onPausePlay = async () => {
  await audioRecorderPlayer.pausePlayer();
};

const onStartPlay = async () => {
  console.log('onStartPlay');

  const msg = await audioRecorderPlayer.startPlayer();
  console.log(msg);
  audioRecorderPlayer.addPlayBackListener(e => {
    setAudioData({
      currentPositionSec: e.currentPosition,
      currentDurationSec: e.duration,
      playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
    });
    return;
  });
};
