import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Text, StyleSheet, View, Easing} from 'react-native';
import {formatTime} from '../../utils/utils';
import {presetBase} from '../../utils/color';
import {Canvas, RoundedRect} from '@shopify/react-native-skia';

interface IRedPulsingTimer {
  timer: number;
}

const RedPulsingTimer = ({timer}: IRedPulsingTimer) => {
  const pulseValue = useMemo(() => new Animated.Value(1), []);

  const inRange = timer <= 29 && timer >= 24;

  const startPulsatingAnimation = useCallback(() => {
    if (inRange && timer !== 30) {
      // Create a pulsing animation when the timer is in range
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else if (timer === 30) {
      pulseValue.setValue(1);
    }
  }, [inRange, timer, pulseValue]);

  useEffect(() => {
    startPulsatingAnimation();
  }, [startPulsatingAnimation]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          {
            color: inRange
              ? presetBase.colors.orangeAction
              : presetBase.colors.white,
          },
          styles.text,
          {transform: [{scale: pulseValue}]},
        ]}>
        {formatTime(timer)}
      </Animated.Text>
    </View>
  );
};

export default RedPulsingTimer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export const VerticalBars = ({intensity}) => {
  const maxBars = 15; // Maximum number of vertical bars
  const barWidth = 5; // Width of each bar
  const maxIntensity = 160; // Maximum sound intensity

  const last15Elements = intensity.slice(-14);

  // Concatenate the original array and the appended array

  // Create a new array filled with the specified value
  const newArray = intensity.length > 15 ? last15Elements : intensity;

  console.log(newArray, 'newArray');

  const barHeights = Array.from({length: maxBars}, (_, index) => {
    const normalizedIntensity = intensity / maxIntensity;
    const minHeight = 10; // Minimum bar height
    const maxHeight = 100; // Maximum bar height
    // const barHeight = minHeight + normalizedIntensity * (maxHeight - minHeight);
    const barHeight = intensity / 12;
    //console.log(barHeight, 'barHeight');
    return barHeight;
  });

  const [animatedHeights] = useState(
    barHeights.map(() => new Animated.Value(0)),
  );

  useEffect(() => {
    // Animate the bar heights based on the intensity
    animatedHeights.forEach((animatedHeight, index) => {
      Animated.timing(animatedHeight, {
        toValue: barHeights[index],
        duration: 500, // Duration of the animation
        useNativeDriver: false, // Set to true if possible
      }).start();
    });
  }, [intensity]);

  return (
    <View style={style.container}>
      {newArray.map((animatedHeight, index) => {
        return (
          <Animated.View
            key={index}
            style={[
              style.bar,
              {
                width: barWidth,
                height: animatedHeight > 140 ? animatedHeight / 6 : 5,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    borderWidth: 1,
    backgroundColor: 'yellow', // Customize the bar color
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', // Align bars at the bottom
    height: '100%', // Adjust to fit the screen height
  },
  bar: {
    backgroundColor: 'red', // Customize the bar color
    marginHorizontal: 3, // Adjust spacing between bars
  },
});

export const AnimatedBarChart = ({data}) => {
  console.log(data, '[]');
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animate the heights of the bars when the component mounts
    Animated.stagger(
      10,
      animatedValues.map((value, index) => {
        return Animated.timing(value, {
          toValue: data[index].height > 0 ? data[index].height * 9 : 5,
          duration: 50, // Adjust animation duration as needed
          easing: Easing.linear,
          useNativeDriver: false,
        });
      }),
    ).start();
  }, [data]);

  return (
    <View style={styl.container}>
      {data.map((item, index) => (
        <Animated.View
          key={item.id}
          style={[styl.bar, {height: animatedValues[index]}]}>
          <Text>{item.height}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styl = StyleSheet.create({
  container: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  bar: {
    width: 10, // Adjust the width of the bars as needed
    marginRight: 5,
    backgroundColor: 'blue', // Adjust the bar color as needed
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

// container: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     justifyContent: 'space-between',
//   },
//   bar: {
//     width: 20, // Adjust the width of the bars as needed
//     backgroundColor: 'blue', // Adjust the bar color as needed
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
