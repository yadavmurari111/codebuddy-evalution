import {numberOfBars} from '../../utils/utils';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {presetBase} from '../../utils/color';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';

interface IWaveformProgress {
  waveWidth: number;
  percentageProgress: number;
  soundDuration: number;
  isFinished: any;
  stop(): void;
}

const WaveformProgress: FunctionComponent<IWaveformProgress> = ({
  waveWidth,
  isFinished,
  percentageProgress,
  soundDuration,
}: IWaveformProgress) => {
  const numLines = numberOfBars(soundDuration);
  const [waveAnimation] = useState(new Animated.Value(0));

  const startWaveAnimation = useCallback(
    (Progress: number) => {
      Animated.timing(waveAnimation, {
        toValue: Progress,
        duration: 1000, // Adjust the animation duration as needed
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    },
    [waveAnimation],
  );

  useEffect(() => {
    if (isFinished) {
      waveAnimation.setValue(0);
      startWaveAnimation(0);
    }
  }, [isFinished, startWaveAnimation]);

  const renderTimeline = () => {
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
            backgroundColor: presetBase.colors.white,
          }}
        />,
      );
    }

    return lines;
  };

  useEffect(() => {
    if (isFinished) {
      startWaveAnimation(0);
    } else {
      // Animate the wave based on the completion percentage
      startWaveAnimation(percentageProgress * (waveWidth / 100));
    }
  }, [percentageProgress, waveWidth]);

  return (
    <Animated.View style={{...styles.container, width: waveAnimation}}>
      <View
        style={{
          maxWidth: 200,
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        {renderTimeline()}
      </View>
    </Animated.View>
  );
};

export default WaveformProgress;

const styles = StyleSheet.create({
  container: {overflow: 'hidden'},
  timelineLine: {
    borderRadius: 20,
    width: 4,
    marginHorizontal: 1.2, // Adjust the margin between lines
  },
});

// import React, {useEffect, useState} from 'react';
// import {Animated, Easing, StyleSheet, View} from 'react-native';
// import Svg, {Line} from 'react-native-svg';
// import {presetBase} from '../../utils/color';
// import timing = Animated.timing;
// import Value = Animated.Value;
//
// interface IWaveform {
//   progressValue?: any;
//   currentDuration?: number;
//   percentageProgress: number;
//   totalDuration?: number;
// }
// const samples = [
//   17, 16, 15, 16, 16, 19, 20, 21, 22, 24, 24, 26, 25, 27, 29, 31, 36, 34, 31,
//   29, 31, 31, 34,
// ];
//
// const WaveformProgress = ({percentageProgress}: IWaveform) => {
//   const [waveAnimation] = useState(new Animated.Value(0));
//   const startWaveAnimation = (Progress: number) => {
//     Animated.timing(waveAnimation, {
//       toValue: Progress,
//       duration: 1000, // Adjust the animation duration as needed
//       easing: Easing.linear,
//       useNativeDriver: false,
//     }).start();
//   };
//   const [waveWidth, setWaveWidth] = useState(200);
//   useEffect(() => {
//     // Animate the wave based on the completion percentage
//     startWaveAnimation((percentageProgress * waveWidth) / 100);
//   }, [percentageProgress]);
//
//   const width = 200; // Adjust as needed
//   const height = 50; // Adjust as needed
//   const horizontalSpacing = 2; // Adjust as needed
//   const verticalCenter = height / 2;
//
//   // Calculate the horizontal spacing between samples
//   const spacing = 10;
//
//   const waveformLines = samples.map((sample, index) => {
//     const x1 = index * spacing + horizontalSpacing / 2;
//     const x2 = x1;
//     const y1 = verticalCenter - sample;
//     const y2 = verticalCenter + sample;
//
//     return (
//       <Line
//         key={index}
//         x1={x1}
//         y1={y1}
//         x2={x2}
//         y2={y2}
//         stroke={presetBase.colors.white}
//         strokeWidth={4}
//       />
//     );
//   });
//   //////////////////////
//
//   const [waveColor] = useState(new Value(0));
//
//   useEffect(() => {
//     // Animate the color based on percentageProgress
//     timing(waveColor, {
//       toValue: percentageProgress,
//       duration: 1000, // Animation duration in milliseconds
//       easing: Easing.linear,
//       useNativeDriver: false,
//     }).start();
//   }, [percentageProgress]);
//
//   const waveformLinesStatic = samples.map((sample, index) => {
//     const x1 = index * spacing + horizontalSpacing / 2;
//     const x2 = x1;
//     const y1 = verticalCenter - sample;
//     const y2 = verticalCenter + sample;
//
//     // Interpolate the color based on the animation progress
//     const strokeColor = waveColor.interpolate({
//       inputRange: [0, 200],
//       outputRange: ['yellow', 'red'], // Adjust the colors as needed
//     });
//
//     console.log(strokeColor, '--color--');
//
//     return (
//       <Line
//         key={index}
//         x1={x1}
//         y1={y1}
//         x2={x2}
//         y2={y2}
//         stroke={'yellow'}
//         strokeWidth={4}
//       />
//     );
//   });
//
//   return (
//     <View
//       onLayout={e => setWaveWidth(e.nativeEvent.layout.width)}
//       style={{
//         borderWidth: 1,
//         backgroundColor: presetBase.colors.blueBase,
//       }}>
//       <Svg height={100} width={width}>
//         {waveformLinesStatic}
//       </Svg>
//       <View style={{alignItems: 'flex-start', position: 'relative'}}>
//         <Animated.View style={[styles.container, {width: waveAnimation}]}>
//           <Svg height={100} width={width}>
//             {waveformLines}
//           </Svg>
//         </Animated.View>
//       </View>
//     </View>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     borderWidth: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     backgroundColor: presetBase.colors.blueBase,
//   },
// });
//
// export default WaveformProgress;
