import React, {useState, useRef} from 'react';
import {View, PanResponder, StyleSheet, Image} from 'react-native';
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

  //

  //

  return (
    <View
      ref={sliderRef}
      style={styles.sliderContainer}
      onLayout={event => setSliderWidth(event.nativeEvent.layout.width)}
      {...panResponder.panHandlers}>
      <View style={{flexDirection: 'row'}}>
        {thumbnails.map((thumbnail, index) => (
          <Image
            key={index}
            source={{uri: thumbnail.path}}
            style={[styles.thumbnail]}
          />
        ))}
      </View>
      <View
        style={[
          styles.range,
          {
            left: `${((start - minValue) / (maxValue - minValue)) * 100}%`,
            width: `${((end - start) / (maxValue - minValue)) * 100}%`,
          },
        ]}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={styles.thumb}>
            <AntDesignIcons name={'angle-left'} size={20} />
          </View>
          <View style={styles.thumb}>
            <AntDesignIcons name={'angle-right'} size={20} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    overflow: 'hidden',
    marginVertical: 5,
    height: 70,
    backgroundColor: 'grey',
    borderRadius: 5,
    flexDirection: 'row',
  },
  range: {
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderColor: presetBase.colors.yellowBase,
    borderRadius: 5,
    position: 'absolute',
    height: '100%',
    backgroundColor: 'transparent',
    opacity: 0.9,
  },
  thumb: {
    width: 20,
    height: '100%',
    backgroundColor: presetBase.colors.yellowBase,
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //position: 'absolute',
  },
  thumbnail: {width: 40, height: 70},
});

export default CustomRangeSlider;

//
// onPanResponderMove: (event, gestureState) => {
//   const totalWidth = sliderWidth;
//   const range = maxValue - minValue;
//
//   const startPercentage = (start - minValue) / range;
//   const endPercentage = (end - minValue) / range;
//
//   const newStart =
//       minValue +
//       startPercentage * range +
//       (gestureState.dx / totalWidth) * range;
//   const newEnd =
//       minValue +
//       endPercentage * range +
//       (gestureState.dx / totalWidth) * range;
//
//   // Ensure the start and end values stay within the valid range
//   if (newStart >= minValue && newEnd <= maxValue && newStart < newEnd) {
//     setStart(newStart);
//     setEnd(newEnd);
//     onValuesChange(newStart, newEnd);
//   }
// },
