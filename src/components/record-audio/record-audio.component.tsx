import React, {FunctionComponent, useEffect, useState} from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {presetBase} from '../../utils/color';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNSoundLevel, {SoundLevelResult} from 'react-native-sound-level';
import WaveAnimation from '../../assets/wave-animation';
import DotAnimation from '../../assets/dot-animation';
import RedPulsingTimer from './red-pulsating-indicator.component';

const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordAudioComponent: FunctionComponent<any> = () => {
  const audibleSound = 120;
  const [duration, setDuration] = useState(0);
  const [showRecording, setShowRecording] = useState(false);
  const [audioLevelsArray, setAudioLevelsArray] = useState([0]);

  useEffect(() => {
    if (duration >= 30) {
      onStopRecord().then(); // stop recording at 30 sec
    }
  }, [duration]);

  const onNewFrameHandler = (data: SoundLevelResult) => {
    audioLevelsArray.shift();
    audioLevelsArray.push(data.value + 160);
  };

  const onStartRecord = async () => {
    setShowRecording(true); // toggle the recording view
    RNSoundLevel.start(); // start monitoring
    RNSoundLevel.onNewFrame = data => onNewFrameHandler(data); // sound levels/intensity
    const result = await audioRecorderPlayer.startRecorder(); // start recording and return result

    audioRecorderPlayer.addRecordBackListener(e =>
      setDuration(Math.floor(e.currentPosition / 1000)),
    );

    console.log(result, 'result');
  };

  const onCancelRecording = async () => {
    setShowRecording(false);
    setAudioLevelsArray([0]);
    setDuration(0);

    await onStopRecord();
  };

  const onStopRecord = async () => {
    setAudioLevelsArray([0]);
    await audioRecorderPlayer.stopRecorder().then(() => RNSoundLevel.stop()); // stopRecorder and audio intensity/level observation
  };

  return (
    <View style={{flex: 1, backgroundColor: 'lightgrey', margin: 5}}>
      {!showRecording && (
        <View
          style={{
            height: 100,
            padding: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'white',
          }}>
          <View style={{justifyContent: 'center', width: 30}}>
            <TouchableOpacity onPress={() => onStartRecord()}>
              <FontAwesome
                name={'microphone'}
                color={presetBase.colors.blueBase}
                size={30}
              />
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
              <AntDesignIcons
                name={'send'}
                color={presetBase.colors.blueBase}
                size={30}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showRecording && (
        <View
          style={{
            height: 100,
            padding: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'white',
          }}>
          <View style={{justifyContent: 'center'}}>
            <TouchableOpacity onPress={() => onCancelRecording()}>
              <AntDesignIcons
                name={'delete'}
                color={presetBase.colors.blueBase}
                size={30}
              />
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
                backgroundColor: presetBase.colors.blueBase,
                width: '100%',
                height: 40,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 100,
                paddingHorizontal: 7,
              }}>
              <View style={{marginLeft: 5}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 100,
                  }}
                  onPress={() => onStopRecord()}>
                  <AntDesignIcons
                    name={'pause'}
                    color={presetBase.colors.blueBase}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  width: '55%',
                  overflow: 'hidden',
                  height: 20,
                  justifyContent: 'center',
                }}>
                {audioLevelsArray[0] < audibleSound && (
                  <DotAnimation play={false} />
                )}
                {audioLevelsArray[0] > audibleSound && (
                  <WaveAnimation play={true} />
                )}
              </View>
              <View style={{minWidth: 45}}>
                <RedPulsingTimer timer={duration} />
              </View>
            </View>
          </View>

          <View style={styles.sendButtonContainer}>
            <TouchableOpacity>
              <AntDesignIcons
                name={'send'}
                color={presetBase.colors.blueBase}
                size={30}
              />
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
