import React, {FunctionComponent, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {presetBase} from '../../utils/color';
import AntDesignIcons from 'react-native-vector-icons/FontAwesome6';
import {formatTime, numberOfBars} from '../../utils/utils';
import useSound from './sound_android_hook';
import WaveformProgress from './wave-progress';
import {ReturnedValue} from './types';

interface IAudioMsg {
  navigation: any;
  soundUrl: string;
  soundDuration: number;
}

const AudioMsgComponent: FunctionComponent<IAudioMsg> = ({
  soundUrl,
  soundDuration,
}: IAudioMsg) => {
  const [waveWidth, setWaveWidth] = useState(0);

  const [play, pause, stop, data] = useSound(soundUrl) as ReturnedValue;
  const {isPlaying, percentageProgress, isFinished, currentTime, loading} =
    data;

  const numLines = numberOfBars(soundDuration); // Calculate the number of lines based on the audio duration and the desired margin

  const renderTimeline = useMemo(() => {
    const lines = []; // Create an array of line elements
    let patternIndex = 0;
    const pattern = [2, 4, 3, 4, 5, 3, 4, 3, 5, 2, 3, 1];

    for (let i = 1; i <= numLines; i++) {
      const currentNumber = pattern[patternIndex];
      patternIndex = (patternIndex + 1) % pattern.length;

      lines.push(
        <View
          key={i}
          style={{
            ...styles.timelineLine,
            height: currentNumber * 6,
            backgroundColor: isFinished
              ? presetBase.colors.white
              : presetBase.colors.grey60,
          }}
        />,
      );
    }

    return lines;
  }, [isFinished, numLines]);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        {!loading && (
          <TouchableOpacity
            style={styles.playPauseContainer}
            onPress={() => (isPlaying ? pause() : play())}>
            <AntDesignIcons
              size={20}
              name={isPlaying ? 'pause' : 'play'}
              color={presetBase.colors.white}
            />
          </TouchableOpacity>
        )}
        {loading && (
          <View style={styles.playPauseContainer}>
            <ActivityIndicator size={'small'} color={'white'} />
          </View>
        )}

        <View
          onLayout={e => setWaveWidth(e.nativeEvent.layout.width)}
          style={styles.timelineContainer}>
          {renderTimeline}
          <View style={styles.waveProgressBox}>
            <WaveformProgress
              waveWidth={Number(waveWidth.toFixed(2))}
              stop={stop}
              isFinished={isFinished}
              percentageProgress={percentageProgress ? percentageProgress : 0}
              soundDuration={soundDuration}
            />
          </View>
        </View>

        <Text style={styles.duration}>
          {isPlaying ? formatTime(currentTime) : formatTime(soundDuration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end', // Adjust this as needed
    marginBottom: 2, // Adjust this as needed to create spacing between bubbles
  },
  bubble: {
    backgroundColor: '#0084ff', // Adjust the color as needed
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '80%', // Adjust the maximum width as needed
  },
  duration: {
    marginLeft: 10,
    minWidth: 40,
    color: 'white', // Adjust the text color as needed
    fontSize: 14, // Adjust the font size as needed
  },
  timelineContainer: {
    maxWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 2,
    marginRight: 2,
  },
  timelineLine: {
    borderRadius: 20,
    width: 4,
    marginHorizontal: 1.2, // Adjust the margin between lines
  },
  playPauseContainer: {padding: 10, minWidth: 40},
  waveProgressBox: {position: 'absolute'},
});

export default AudioMsgComponent;
