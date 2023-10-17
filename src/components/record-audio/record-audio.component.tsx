import React, {FunctionComponent, useEffect, useState} from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {presetBase} from '../../utils/color';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVModeIOSOption,
} from 'react-native-audio-recorder-player';
// import RNSoundLevel, {SoundLevelResult} from 'react-native-sound-level';
import WaveAnimation from '../../assets/wave-animation';
import DotAnimation from '../../assets/dot-animation';
import RedPulsingTimer from './red-pulsating-indicator.component';
import RNFetchBlob from 'rn-fetch-blob';

const meteringEnabled = true;
const audioRecorderPlayer = new AudioRecorderPlayer();

const dirs = RNFetchBlob.fs.dirs;
const path = Platform.select({
  ios: `${dirs.CacheDir}/hello.m4a`,
  android: `${dirs.CacheDir}/hello.mp3`,
});

const audioSet: AudioSet = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  AVModeIOS: AVModeIOSOption.measurement,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
  AVNumberOfChannelsKeyIOS: 2,
  AVFormatIDKeyIOS: AVEncodingOption.aac,
};

const RecordAudioComponent: FunctionComponent<any> = () => {
  const audibleSound = 145;
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [showRecording, setShowRecording] = useState(false);
  const [audioLevelsArray, setAudioLevelsArray] = useState([
    {id: 1, height: 5},
  ]);

  useEffect(() => {
    if (duration >= 30) {
      onStopRecord().then(); // stop recording at 30 sec
    }
  }, [duration]);

  const onStartRecord = async () => {
    setIsPaused(false);
    setShowRecording(true); // toggle the recording view
    const result = await audioRecorderPlayer.startRecorder(
      path,
      audioSet,
      meteringEnabled,
    ); // start recording and return result

    audioRecorderPlayer.addPlayBackListener(e => {
      console.log(e, 'addPlayBackListener==============');
    });

    audioRecorderPlayer.addRecordBackListener(e => {
      //console.log(e, 'response');
      setDuration(Math.floor(e.currentPosition / 1000));
      //audioLevelsArray.shift();
      audioLevelsArray.push({
        id: e.currentPosition,
        height: e.currentMetering ? e.currentMetering + 20 : 0,
      });
    });

    console.log(result, 'result');
  };
  console.log(audioLevelsArray[0], 'audioLevelsArray');

  const onCancelRecording = async () => {
    setShowRecording(false);
    setAudioLevelsArray([{id: 1, height: 5}]);
    setDuration(0);

    await onStopRecord();
  };

  const pauseRecording = async () => {
    try {
      setIsPaused(!isPaused);
      setAudioLevelsArray([{id: 1, height: 5}]);
      await audioRecorderPlayer.pauseRecorder();
      // await RNSoundLevel.stop();
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      setIsPaused(!isPaused);
      await audioRecorderPlayer.resumeRecorder();
      // await RNSoundLevel.start();
      // RNSoundLevel.onNewFrame = data => onNewFrameHandler(data);
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
  };

  const onStopRecord = async () => {
    setAudioLevelsArray([{id: 1, height: 5}]);
    await audioRecorderPlayer.stopRecorder().then(); // stopRecorder and audio intensity/level observation
  };

  const barData = [
    {id: 1, height: 50},
    {id: 2, height: 80},
    {id: 3, height: 30},
    {id: 4, height: 50},
    {id: 5, height: 80},
    {id: 6, height: 30},
    {id: 7, height: 50},
    {id: 8, height: 80},
    {id: 9, height: 30},
    // Add more data as needed
  ];

  const data = Array.from(
    {length: 15 - audioLevelsArray.length},
    (_, index) => ({id: index, height: 5}),
  );

  return (
    <View style={{flex: 1, backgroundColor: 'lightgrey', margin: 5}}>
      {/*<AnimatedBarChart*/}
      {/*  data={*/}
      {/*    audioLevelsArray.length > 15*/}
      {/*      ? audioLevelsArray.slice(-15)*/}
      {/*      : audioLevelsArray.concat(data)*/}
      {/*  }*/}
      {/*/>*/}
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
              <MaterialCommunityIcons
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
              <MaterialCommunityIcons
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
                  onPress={() =>
                    isPaused ? resumeRecording() : pauseRecording()
                  }>
                  <AntDesignIcons
                    name={isPaused ? 'play' : 'pause'}
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
                {audioLevelsArray[0].height < audibleSound && <DotAnimation />}
                {audioLevelsArray[0].height > audibleSound && (
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
              <MaterialCommunityIcons
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
