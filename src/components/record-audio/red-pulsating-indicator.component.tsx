import React, {useCallback, useEffect, useMemo} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {formatTime} from '../../utils/utils';
import {presetBase} from '../../utils/color';

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
