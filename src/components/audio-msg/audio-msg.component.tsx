import React, {FunctionComponent, useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {presetBase} from '../../utils/color';
import AntDesignIcons from 'react-native-vector-icons/FontAwesome6';
import {formatTime, numberOfBars} from '../../utils/utils';
import useSound from './sound_android_hook';
import {useState, useEffect} from 'react';

interface IAudioMsg {
  navigation: any;
  soundUrl: string;
  soundDuration: number;
}

const AudioMsgComponent: FunctionComponent<IAudioMsg> = ({
  soundUrl,
  soundDuration,
}: IAudioMsg) => {
  const [play, pause, _stop, data] = useSound(soundUrl);
  const {isPlaying, duration, currentTime, loading} = data;

  const numLines = numberOfBars(soundDuration); // Calculate the number of lines based on the audio duration and the desired margin

  const percentageProgress = (currentTime / duration) * 100;
  const playbackIndicator = (percentageProgress * numLines) / 100; //progress bar

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
            backgroundColor:
              playbackIndicator + 1 <= i
                ? presetBase.colors.grey80
                : presetBase.colors.white,
          }}
        />,
      );
    }

    return lines;
  }, [numLines, playbackIndicator]);

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
        {loading && <ActivityIndicator size={'small'} color={'white'} />}

        <View style={styles.timelineContainer}>{renderTimeline}</View>

        <Text style={styles.duration}>
          {isPlaying ? formatTime(currentTime) : formatTime(soundDuration)}
        </Text>
      </View>
      {/*<VideoPlayer currentDuration={currentTime} totalDuration={duration} />*/}
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
    marginHorizontal: 1, // Adjust the margin between lines
  },
  playPauseContainer: {padding: 10, minWidth: 40},
});

export default AudioMsgComponent;

const VideoPlayer = ({currentDuration, totalDuration}) => {
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    // Update the progress value based on currentDuration and totalDuration
    const newProgress = (currentDuration / totalDuration) * 100;
    animateProgress(newProgress);
  }, [currentDuration, totalDuration]);

  const animateProgress = (toValue: number) => {
    Animated.timing(progress, {
      toValue,
      duration: 500, // Animation duration in milliseconds
      easing: Easing.linear,
      useNativeDriver: false, // Required for backgroundColor animation
    }).start();
  };

  // Interpolate the background color based on progress
  const interpolatedBackgroundColor = progress.interpolate({
    inputRange: [0, 100], // Progress values from 0% to 100%
    outputRange: ['blue', 'red'], // Background color transitions from blue to red
  });

  return (
    <View style={style.container}>
      <Animated.View
        style={[
          style.progressContainer,
          {
            width: `${progress}%`,
            backgroundColor: interpolatedBackgroundColor,
          },
        ]}
      />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgray',
  },
  progressContainer: {
    height: 50, // Adjust the height as needed
  },
});
