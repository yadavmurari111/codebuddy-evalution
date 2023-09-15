import React, {useState, useEffect} from 'react';
import {View, PanResponder, StyleSheet} from 'react-native';

const YourCustomRangeSlider = ({
  minValue,
  maxValue,
  startValue,
  endValue,
  onValuesChange,
}) => {
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);
  const [start, setStart] = useState(startValue);
  const [end, setEnd] = useState(endValue);
  const [sliderWidth, setSliderWidth] = useState(0);

  useEffect(() => {
    setStartX((startValue / maxValue) * 100);
    setEndX((endValue / maxValue) * 100);
  }, [startValue, endValue, maxValue]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (event, gestureState) => {
      const totalWidth = sliderWidth;
      const range = maxValue - minValue;
      const secondsPerPixel = range / totalWidth; // Calculate how many seconds correspond to each pixel.

      const startPercentage = (start - minValue) / range;
      const endPercentage = (end - minValue) / range;

      // Calculate how much to change the start and end values based on the gesture's horizontal movement.
      const secondsToChange = gestureState.dx * secondsPerPixel;

      const newStart = start + secondsToChange;
      const newEnd = end + secondsToChange;

      // Ensure the start and end values stay within the valid range
      if (newStart >= minValue && newEnd <= maxValue && newStart < newEnd) {
        setStart(newStart);
        setEnd(newEnd);
        onValuesChange(newStart, newEnd);
      }
    },
    onPanResponderRelease: () => {},
  });

  const handleStartMove = gestureState => {
    const x = gestureState.moveX;
    const position = (x / windowWidth) * 100;
    if (position >= 0 && position <= endX - 10) {
      setStartX(position);
      const start = (position / 100) * maxValue;
      onValuesChange(start, endValue);
    }
  };

  const handleEndMove = gestureState => {
    const x = gestureState.moveX;
    const position = (x / windowWidth) * 100;
    if (position >= startX + 10 && position <= 100) {
      setEndX(position);
      const end = (position / 100) * maxValue;
      onValuesChange(startValue, end);
    }
  };

  const windowWidth = 300; // Customize this according to your UI

  const startResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => handleStartMove(gestureState),
  });

  const endResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => handleEndMove(gestureState),
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.slider,
          {left: `${startX}%`, width: `${endX - startX}%`},
        ]}
      />
      <View
        {...startResponder.panHandlers}
        style={[styles.handle, {left: `${startX}%`}]}
      />
      <View
        {...endResponder.panHandlers}
        style={[styles.handle, {left: `${endX}%`}]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'grey',
    justifyContent: 'center',
  },
  slider: {
    position: 'absolute',
    height: 40,
    backgroundColor: 'black', // Customize slider color
  },
  handle: {
    position: 'absolute',
    width: 10,
    height: 50,
    backgroundColor: 'red', // Customize handle color
    borderRadius: 5,
  },
});

export default YourCustomRangeSlider;
