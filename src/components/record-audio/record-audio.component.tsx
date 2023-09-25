import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
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
import RNSoundLevel from 'react-native-sound-level';

const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordAudioComponent: FunctionComponent<any> = () => {
  const [waveBoxWidth, setWaveBoxWidth] = useState(0);
  const [animationWidth, setAnimationWidth] = useState(0);
  const [showRecording, setShowRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevelsArray, setAudioLevelsArray] = useState<number[]>([]);
  const animationValue = useRef(new Animated.Value(0)).current; // Initialize an Animated.Value to track the width of the Animated.View

  const onStartRecord = async () => {
    setShowRecording(true);
    startAnimation();
    RNSoundLevel.start({monitoringInterval: 500, samplingRate: 16000}); // start monitoring
    RNSoundLevel.onNewFrame = data => {
      // see "Returned data" section below
      console.log('Sound level info', data);
      audioLevelsArray.push(data.value + 160);
    };

    const result = await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener(e => {
      console.log(e, 'e');
      setDuration(e.currentPosition / 1000);
    });

    console.log(result, 'result');
  };

  const onStopRecord = async () => {
    setShowRecording(false);
    RNSoundLevel.stop();
    setDuration(0);
    animationValue.setValue(0);
    setAudioLevelsArray([]);

    await audioRecorderPlayer.stopRecorder();
  };

  console.log(audioLevelsArray, '==');

  const startAnimation = () => {
    // Animate the width from 0 to 100% over soundDuration (in seconds)
    Animated.timing(animationValue, {
      toValue: 100000, // Final width is 100%
      duration: 30 * 1000, // Animation duration in milliseconds (30 seconds)
      useNativeDriver: false, // Set to true if you want to use the native driver
    }).start(result => {
      if (result.finished) {
        //animationValue.setValue(0);
      }
    });
  };

  const translateX = useRef(new Animated.Value(0)).current;

  const animationConfig = {
    toValue: waveBoxWidth,
    duration: 1000, // Adjust the duration as needed
    useNativeDriver: false, // Necessary for 'translateX' animation
  };

  // Define the animation
  const translateAnimation = Animated.timing(translateX, animationConfig);

  // Start the animation when the component mounts
  useEffect(() => {
    translateAnimation.start();
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: 'lightgrey'}}>
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
            <TouchableOpacity onPress={() => onStopRecord()}>
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
                <TouchableOpacity onPress={() => {}}>
                  <AntDesignIcons name={'pause'} color={'blue'} size={20} />
                </TouchableOpacity>
              </View>
              <View
                onLayout={event =>
                  setWaveBoxWidth(event.nativeEvent.layout.width)
                }
                style={{
                  width: '70%',
                  overflow: 'hidden',
                  height: 20,
                  alignItems: 'center',
                  //backgroundColor: 'grey',
                }}>
                <Animated.View
                  onLayout={event =>
                    setAnimationWidth(event.nativeEvent.layout.width)
                  }
                  style={{
                    flexDirection: 'row',
                    height: 20,
                    alignItems: 'center',
                    transform: [{translateX}],
                  }}>
                  {audioLevelsArray.map((data, index) => (
                    <View
                      key={index}
                      style={{
                        width: 3,
                        borderRadius: 50,
                        marginRight: 1,
                        backgroundColor: 'white',
                        height: data < 120 ? 5 : data / 8,
                      }}
                    />
                  ))}
                </Animated.View>
              </View>
              <View>
                <Text style={{color: 'white', fontWeight: '700'}}>
                  {formatTime(duration)}
                </Text>
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
const onPausePlay = async () => {
  await audioRecorderPlayer.pausePlayer();
};

const onStopPlay = async () => {
  console.log('onStopPlay');
  await audioRecorderPlayer.stopPlayer();
  audioRecorderPlayer.removePlayBackListener();
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
