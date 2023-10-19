import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';

import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import {presetBase} from '../../utils/color';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import {formatTime} from '../../utils/utils';

interface IVideoPlayerComponent {
  url: string;
  route: any;
  isFullscreen: boolean;
}

const FullscreenVideoPlayer: FunctionComponent<IVideoPlayerComponent> = ({
  route,
}) => {
  const videoData = route.params.videoData;
  const videoRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoPosition, setVideoPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showControls, setShowControls] = useState(false); // State to show/hide controls

  // Function to hide controls after a delay
  const hideControlsAfterDelay = () => {
    if (showControls) {
      setTimeout(() => {
        setShowControls(false);
      }, 3000); // 3000 milliseconds (3 seconds)
    }
  };

  // console.log(route);
  // console.log(videoData.uri);

  const aspectRatio = 9 / 16;

  useEffect(() => {
    // Download and cache the video file
    downloadAndCacheVideo();
  }, []);

  const remoteVideoUrl = videoData.uri;
  const [videoUri, setVideoUri] = useState(null);

  const downloadAndCacheVideo = async () => {
    const localVideoPath = `${RNFS.CachesDirectoryPath}/cached_video.mp4`;

    // Check if the video is already cached
    const videoExists = await RNFS.exists(localVideoPath);

    if (!videoExists) {
      // Download the video and save it to the local cache
      const downloadResult = await RNFS.downloadFile({
        fromUrl: remoteVideoUrl,
        toFile: localVideoPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        setVideoUri(localVideoPath); // Set the cached video as the source
      }
    } else {
      setVideoUri(localVideoPath); // Use the cached video
    }
  };

  return (
    <View style={styles.container}>
      {videoUri && (
        <TouchableOpacity
          onPress={() => setShowControls(true)}
          style={{justifyContent: 'center', alignItems: 'center'}}>
          <>
            <Video
              repeat
              ref={videoRef}
              paused={paused}
              resizeMode={'cover'}
              source={{
                uri: videoUri,
              }} // Can be a URL or a local file.
              onLoad={({duration}) => {
                if (videoRef.current) {
                  // @ts-ignore
                  videoRef.current.seek(0);
                  setLoading(false);
                  setVideoDuration(duration);
                  // console.log(duration, 'duration');
                }
              }}
              onEnd={() => {
                if (videoRef.current) {
                  videoRef.current.seek(0);
                }
                setVideoPosition(0);
                setShowControls(true);
                setPaused(true);
              }}
              onProgress={e => setVideoPosition(e.currentTime)}
              style={{
                width: '100%',
                borderRadius: 0,
                aspectRatio: aspectRatio,
              }}
            />

            {showControls && (
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: 'black',
                  zIndex: 999,
                  borderRadius: 100,
                  padding: 8,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setPaused(!paused);
                    hideControlsAfterDelay();
                  }}>
                  <AntDesignIcons
                    name={paused ? 'play' : 'pause'}
                    color={presetBase.colors.white}
                    size={80}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        </TouchableOpacity>
      )}
      {!videoUri && (
        <View
          style={{width: '100%', borderRadius: 0, aspectRatio: aspectRatio}}>
          <ActivityIndicator size={'large'} />
        </View>
      )}
      <Slider
        style={{width: '100%', backgroundColor: 'lightgrey', height: 40}}
        minimumValue={0}
        maximumValue={videoDuration}
        value={Math.ceil(videoPosition)}
        step={0.01}
        minimumTrackTintColor="red"
        maximumTrackTintColor={presetBase.colors.purpleBase}
        onValueChange={value => {
          //console.log(value);
          if (videoRef.current) {
            // @ts-ignore
            videoRef.current.seek(value); // Seek to the selected position
            if (value === videoDuration) {
              setVideoPosition(0);
              videoRef.current.seek(0);
            }
          }
        }}
      />
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          width: '90%',
        }}>
        <Text>{formatTime(0)}</Text>
        <Text>{formatTime(videoDuration)}</Text>
      </View>
    </View>
  );
};

export default FullscreenVideoPlayer;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
