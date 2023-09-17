import React, {useState, useRef} from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Image,
  PanResponderGestureState,
} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/FontAwesome6';
import {presetBase} from '../../utils/color';
import {Thumbnail} from 'react-native-create-thumbnail';

interface ICustomRangeSlider {
  minValue: number;
  maxValue: number;
  startValue: number;
  endValue: number;
  thumbnails: Thumbnail[];
  onValuesChange(newStart: number, newEnd: number): void;
}

const CustomRangeSlider = ({
  minValue,
  maxValue,
  startValue,
  endValue,
  thumbnails,
  onValuesChange,
}: ICustomRangeSlider) => {
  const [start, setStart] = useState(startValue);
  const [end, setEnd] = useState(endValue);
  const [sliderWidth, setSliderWidth] = useState(0);

  const sliderRef = useRef(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (event, gestureState) => {
      const totalWidth = sliderWidth;
      const range = maxValue - minValue;
      const secondsPerPixel = range / totalWidth; // Calculate how many seconds correspond to each pixel.
      const secondsToChange = gestureState.dx * secondsPerPixel; // Calculate how much to change the start and end values based on the gesture's horizontal movement.

      const newStart = start + secondsToChange;
      const newEnd = end + secondsToChange;

      // Ensure the start and end values stay within the valid range
      if (newStart >= minValue && newEnd <= maxValue && newStart < newEnd) {
        onValuesChange(newStart, newEnd);
        setStart(newStart);
        setEnd(newEnd);
      }
    },
    onPanResponderRelease: () => {},
  });

  const handleStartMove = (gestureState: PanResponderGestureState) => {
    const totalWidth = sliderWidth;
    const range = maxValue - minValue;
    const secondsPerPixel = range / totalWidth; // Calculate how many seconds correspond to each pixel.
    const secondsToChange = gestureState.dx * secondsPerPixel; // Calculate how much to change the start and end values based on the gesture's horizontal movement.

    const newStart = start + secondsToChange;
    console.log(endValue - newStart);
    if (
      newStart >= minValue &&
      newStart < endValue - 10 && //minimum duration of slider is 10 sec
      endValue - newStart <= 30 // slider should not exceed 30 sec , change it to configure accordingly
    ) {
      onValuesChange(newStart, endValue);
      setStart(newStart);
    }
  };

  const handleEndMove = (gestureState: PanResponderGestureState) => {
    const totalWidth = sliderWidth;
    const range = maxValue - minValue;
    const secondsPerPixel = range / totalWidth; // Calculate how many seconds correspond to each pixel.
    const secondsToChange = gestureState.dx * secondsPerPixel; // Calculate how much to change the start and end values based on the gesture's horizontal movement.

    const newEnd = end + secondsToChange;
    console.log(newEnd - startValue);
    if (
      newEnd <= maxValue &&
      newEnd > startValue + 10 && //minimum duration of slider is 10 sec
      newEnd - startValue <= 30 // slider should not exceed 30 sec , change it to configure accordingly
    ) {
      onValuesChange(startValue, newEnd);
      setEnd(newEnd);
    }
  };

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
    <View
      ref={sliderRef}
      style={styles.sliderContainer}
      onLayout={event => setSliderWidth(event.nativeEvent.layout.width)}>
      <View style={styles.thumbnailContainer}>
        {thumbnails.map((thumbnail, index) => (
          <Image
            key={index}
            source={{uri: thumbnail.path}}
            style={[styles.thumbnail]}
          />
        ))}
      </View>
      <View
        {...startResponder.panHandlers}
        style={[
          styles.handle,
          styles.handleLeft,
          {left: `${((start - minValue) / (maxValue - minValue)) * 100}%`},
        ]}>
        <AntDesignIcons name={'angle-left'} size={22} color={'white'} />
      </View>
      <View
        {...endResponder.panHandlers}
        style={[
          styles.handle,
          styles.handleRight,
          {left: `${((end - minValue) / (maxValue - minValue)) * 100}%`},
        ]}>
        <AntDesignIcons name={'angle-right'} size={22} color={'white'} />
      </View>
      <View
        {...panResponder.panHandlers}
        style={[
          styles.range,
          {
            left: `${(start / (maxValue - minValue)) * 100}%`,
            width: `${((end - start) / (maxValue - minValue)) * 100}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    overflow: 'hidden',
    marginVertical: 5,
    height: 80,
    backgroundColor: 'grey',
    borderRadius: 0,
    flexDirection: 'row',
  },
  range: {
    borderRadius: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderColor: presetBase.colors.orangeAction,
    position: 'absolute',
    height: '100%',
    backgroundColor: 'transparent',
  },
  thumbnail: {width: 40, height: 80},
  handle: {
    marginRight: 0,
    zIndex: 999,
    position: 'absolute',
    width: 15,
    height: 80,
    backgroundColor: presetBase.colors.orangeAction, // Customize handle color
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleLeft: {marginRight: 5},
  handleRight: {marginLeft: -13},
  thumbnailContainer: {flexDirection: 'row'},
});

export default CustomRangeSlider;
