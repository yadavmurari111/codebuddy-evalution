import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
//import {createThumbnail, Thumbnail} from 'react-native-create-thumbnail';

import Video, {OnProgressData} from 'react-native-video';
import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import {presetBase} from './utils/color';
import {compressVideo, formatTime} from './utils/utils';
import CustomRangeSlider from './components/custom-slider/custom-slider.component';

interface IVideoTrimScreen {
  navigation: any;
  route: any;
}

const VideoTrimScreen: FunctionComponent<IVideoTrimScreen> = ({
  route,
}: IVideoTrimScreen) => {
  const {width} = useWindowDimensions();
  const videoData = route.params.videoData;
  const videoRef = useRef(null);
  const [duration] = useState(videoData[0].duration);
  const [videoUri] = useState(videoData[0].uri);

  const [paused, setPaused] = useState(true);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  //const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [compressionProgress, setCompressionProgress] = useState('');

  const onPlayPause = () => {
    if (videoRef.current) {
      // @ts-ignore
      videoRef.current.seek(trimStart);
      setPaused(!paused);
    }
  };

  const handleCompression = () => {
    console.log('clicked');
    compressVideo(videoUri).then(progress => setCompressionProgress(progress));
  };

  const onProgress = ({currentTime}: OnProgressData) => {
    // Check if we have reached the trimEnd, than reset trimStart and stop playing
    if (currentTime >= trimEnd) {
      if (videoRef.current) {
        // @ts-ignore
        videoRef.current.seek(trimStart);
        setPaused(!paused);
      }
    }
  };

  // generate thumbnails for the timeline on the slider-bar
  const generateThumbnails = useCallback(
    async (videoUrl: string, count: number) => {
      const thumbnailCount = count || 8;
      const interval = Math.floor(duration / thumbnailCount);
      const thumbnailPromises = [];

      for (let i = 0; i < thumbnailCount; i++) {
        const time = i * interval * 1000;
        thumbnailPromises.push(
          createThumbnail({
            url: videoUrl,
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
    },
    [duration],
  );

  // useEffect(() => {
  //   const num = Math.floor(width / 40);
  //   generateThumbnails(videoUri, num)
  //     .then(thumbnail => setThumbnails(thumbnail))
  //     .catch(error => console.error('Thumbnail generation error:', error));
  // }, [generateThumbnails, videoUri, width]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.playerContainer}>
        <Video
          resizeMode={'stretch'}
          ref={videoRef}
          paused={paused}
          source={{uri: videoUri}} // Can be a URL or a local file.
          onLoad={() => {
            if (videoRef.current) {
              // @ts-ignore
              videoRef.current.seek(0);
            }
          }} // this will set first frame of video as thumbnail
          onProgress={onProgress}
          style={{
            ...styles.video,
            aspectRatio: videoData[0].width / videoData[0].height,
          }}
        />
        <View style={styles.playPauseContainer}>
          <TouchableOpacity onPress={() => onPlayPause()}>
            <AntDesignIcons
              name={paused ? 'play' : 'pause'}
              color={presetBase.colors.black}
              size={40}
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
        //thumbnails={thumbnails}
        onValuesChange={(start, end) => {
          setTrimStart(start);
          setTrimEnd(end);
          setPaused(true);
          // @ts-ignore
          videoRef.current.seek(start);
        }}
      />

      <View style={styles.sendButtonContainer}>
        <TouchableOpacity onPress={handleCompression}>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
      <Text>{'compressionProgress: ' + compressionProgress}</Text>
    </ScrollView>
  );
};

export default VideoTrimScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    paddingBottom: 200,
  },
  playerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    borderWidth: 1,
    width: '80%',
    borderRadius: 12,
  },
  playPauseContainer: {
    zIndex: 999,
    flex: 1,
    padding: 10,
    opacity: 0.7,
    borderRadius: 100,
    position: 'absolute',
    backgroundColor: presetBase.colors.white,
  },
  trimControls: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  sendButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginTop: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '700',
    padding: 12,
    backgroundColor: presetBase.colors.blueBase,
    borderRadius: 10,
  },
});
