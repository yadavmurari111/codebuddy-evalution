import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {createThumbnail, Thumbnail} from 'react-native-create-thumbnail';

import Video from 'react-native-video';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import {presetBase} from './utils/color';
import CustomRangeSlider from './components/send-video/custom-slider.component';
import {formatTime} from './utils/utils';
import YourCustomRangeSlider from './components/send-video/slider.component';
import CombinedRangeSlider from './components/send-video/merge-slider.component';
import VideoTrimmer from './components/send-video/merge-slider.component';

const VideoTrimScreen = ({navigation, route}: any) => {
  const videoData = route.params.videoData;
  const videoRef = useRef(null);
  const [duration] = useState(videoData[0].duration);
  const [videoUri] = useState(videoData[0].uri);

  const [paused, setPaused] = useState(true);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);

  const onPlayPause = () => {
    if (videoRef.current) {
      videoRef.current.seek(trimStart);
      setPaused(!paused);
    }
  };

  // const onStop = () => {
  //   videoRef.current.seek(trimEnd);
  //   setIsPlaying(false);
  // };

  const generateThumbnails = async (videoUri, count) => {
    const thumbnailCount = count || 5;
    const interval = Math.floor(duration / thumbnailCount);
    const thumbnailPromises = [];

    for (let i = 0; i < thumbnailCount; i++) {
      const time = i * interval * 1000;
      thumbnailPromises.push(
        createThumbnail({
          url: videoUri,
          timeStamp: time,
        }),
      );
    }

    try {
      const thumbnailResults = await Promise.all(thumbnailPromises);
      return thumbnailResults.map(result => result);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      return [];
    }
  };
  const {width} = useWindowDimensions();

  useEffect(() => {
    const num = Math.floor(width / 40);
    generateThumbnails(videoUri, num)
      .then(thumbnail => {
        setThumbnails(thumbnail);
        console.log('Generated Thumbnails:', thumbnail);
        // You can use the thumbnails array as needed
      })
      .catch(error => {
        console.error('Thumbnail generation error:', error);
      });
  }, [videoUri]);

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: 'white',
        paddingBottom: 200,
      }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Video
          resizeMode={'stretch'}
          ref={videoRef}
          paused={paused}
          source={{uri: videoUri}} // Can be a URL or a local file.
          onLoad={() => {
            videoRef.current.seek(0); // this will set first frame of video as thumbnail
          }}
          onProgress={({currentTime}) => {
            // Check if we have reached the end point, and stop playing
            if (currentTime >= trimEnd) {
              if (videoRef.current) {
                videoRef.current.seek(trimStart);
                setPaused(!paused);
              }
            }
          }}
          style={{
            borderWidth: 1,
            width: '80%',
            aspectRatio: videoData[0].width / videoData[0].height,
            borderRadius: 12,
          }}
        />
        <View
          style={{
            flex: 1,
            position: 'absolute',
            backgroundColor: presetBase.colors.white,
            zIndex: 999,
          }}>
          <TouchableOpacity onPress={() => onPlayPause()}>
            <AntDesignIcons
              name={paused ? 'play' : 'pause'}
              color={presetBase.colors.black}
              size={60}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.trimControls}>
        <Text>Trim Start: {formatTime(trimStart)}s</Text>
        <Text>Trim End: {formatTime(trimEnd)}s</Text>
      </View>
      <CustomRangeSlider
        minValue={0}
        maxValue={duration}
        startValue={trimStart}
        endValue={trimEnd}
        thumbnails={thumbnails}
        onValuesChange={(start: number, end: number) => {
          console.log(start, end);
          console.log('start', 'end');
          console.log('------');
          setTrimStart(start);
          setTrimEnd(end);
        }}
      />
      <YourCustomRangeSlider
        minValue={0}
        maxValue={duration}
        startValue={trimStart}
        endValue={trimEnd}
        thumbnails={thumbnails}
        onValuesChange={(start: number, end: number) => {
          console.log(start, end);
          console.log('start', 'end');
          console.log('------');
          setTrimStart(start);
          setTrimEnd(end);
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          flexDirection: 'row',
          marginTop: 20,
        }}>
        <TouchableOpacity style={{borderRadius: 100}}>
          <Text
            style={{
              color: 'white',
              fontWeight: '700',
              padding: 12,
              backgroundColor: presetBase.colors.blueBase,
              borderRadius: 100,
            }}>
            SEND
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VideoTrimScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Adjust this as needed
    marginBottom: 2, // Adjust this as needed to create spacing between bubbles
  },

  video: {
    width: 300,
    height: 200,
  },
  trimControls: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  slider: {
    width: 300,
    height: 40,
    backgroundColor: 'black',
  },
  trimButton: {
    marginTop: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
});
