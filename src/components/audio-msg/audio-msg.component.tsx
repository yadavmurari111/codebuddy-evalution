import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import {presetBase} from '../../utils/color';
import AntDesignIcons from 'react-native-vector-icons/FontAwesome6';
import {formatTime, numberOfBars} from '../../utils/utils';
import useSound from '../audio-msg/sound_android_hook';
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
  const numLines = numberOfBars(soundDuration); // Calculate the number of lines based on the audio duration and the desired margin
  const [play, pause, stop, data] = useSound(soundUrl) as ReturnedValue;
  const {isPlaying, currentTime, loading} = data;

  // Initialize an Animated.Value to track the width of the Animated.View
  const widthValue = useRef(new Animated.Value(0)).current;
  const [waveWidth, setWaveWidth] = useState(0);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  const startAnimation = () => {
    if (isAnimationFinished) {
      widthValue.setValue(0); // Reset the widthValue to 0 before starting the animation when animation finished playing
    }

    // Animate the width from 0 to 100% over soundDuration (in seconds)
    Animated.timing(widthValue, {
      toValue: 1, // 1 represents 100% width
      duration: soundDuration * 1000, //  duration of animation
      useNativeDriver: false, // Required for Android
    }).start(result => {
      setIsAnimationFinished(result.finished); // upon Animation is completed
    });
  };

  const stopAnimation = () => {
    widthValue.stopAnimation(value => {
      // Store the current value when animation is stopped
      widthValue.setValue(value);
    });
  };

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
      stopAnimation();
    } else {
      play();
      if (!loading) {
        startAnimation();
      }
    }
  }, [isPlaying, loading]);

  const renderLines = useMemo(() => {
    const lines = []; // Create an array of line elements
    let patternIndex = 0;
    const pattern = [2, 4, 3, 4, 5, 3, 4, 3, 5, 2, 3, 1];

    for (let i = 1; i <= numLines; i++) {
      const scaleFactor = 6;
      const currentNumber = pattern[patternIndex];
      patternIndex = (patternIndex + 1) % pattern.length;

      lines.push(
        <View
          key={i}
          style={{
            ...styles.timelineLine,
            height: currentNumber * scaleFactor,
            backgroundColor: presetBase.colors.grey80,
          }}
        />,
      );
    }
    return lines;
  }, [numLines]);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        {!loading && (
          <TouchableOpacity
            style={styles.playPauseContainer}
            onPress={() => handlePlayPause()}>
            <AntDesignIcons
              size={18}
              name={isPlaying ? 'pause' : 'play'}
              color={presetBase.colors.white}
            />
          </TouchableOpacity>
        )}
        {loading && (
          <View style={styles.playPauseContainer}>
            <ActivityIndicator size={'small'} color={presetBase.colors.white} />
          </View>
        )}
        {!isPlaying && waveWidth === 0 && (
          <View
            onLayout={e => setWaveWidth(e.nativeEvent.layout.width)}
            style={styles.lineContainer}>
            {renderLines}
          </View>
        )}
        {waveWidth > 0 && (
          <View style={{width: waveWidth}}>
            <MaskedView
              style={{
                backgroundColor: isPlaying
                  ? presetBase.colors.grey80
                  : presetBase.colors.white,
              }}
              maskElement={
                <View style={styles.maskedLineContainer}>{renderLines}</View> //mask component
              }>
              {/* Shows behind the mask, progressbar */}
              <Animated.View
                style={[
                  styles.animatedProgress,
                  {
                    width: widthValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </MaskedView>
          </View>
        )}

        <Text style={styles.duration}>
          {isPlaying ? formatTime(currentTime) : formatTime(soundDuration)}
        </Text>
      </View>
    </View>
  );
};

export default AudioMsgComponent;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end', // Adjust this as needed
    marginBottom: 2, // Adjust this as needed to create spacing between bubbles
  },
  bubble: {
    backgroundColor: '#0084ff', // Adjust the color as needed
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%', // Adjust the maximum width as needed
  },
  duration: {
    marginLeft: 10,
    minWidth: 40,
    color: 'white', // Adjust the text color as needed
    fontSize: 14, // Adjust the font size as needed
  },
  timelineContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 2,
    marginRight: 2,
  },
  timelineLine: {
    borderRadius: 20,
    width: 3, // bar width
    marginHorizontal: 1.2, // Adjust the margin between lines
  },
  playPauseContainer: {padding: 10, minWidth: 40},
  waveProgressBox: {position: 'absolute'},
  lineContainer: {alignItems: 'center', flexDirection: 'row'},
  maskedLineContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent', // Transparent background because mask is based off alpha channel.
  },
  animatedProgress: {
    height: 30,
    backgroundColor: 'white',
  },
});
