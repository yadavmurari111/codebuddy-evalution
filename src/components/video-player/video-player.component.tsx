import React, {FunctionComponent, useRef, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import {presetBase} from '../../utils/color';
import Video from 'react-native-video';

interface IVideoPlayerComponent {
  url: string;
}

const VideoPlayerComponent: FunctionComponent<IVideoPlayerComponent> = ({
  url,
}) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [paused, setPaused] = useState(true);
  const aspectRatio = 9 / 16;

  return (
    <View style={styles.container}>
      {url && (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Video
            ref={videoRef}
            paused={paused}
            resizeMode={'cover'}
            source={{uri: url}} // Can be a URL or a local file.
            onLoad={() => {
              if (videoRef.current) {
                // @ts-ignore
                videoRef.current.seek(0);
                setLoading(false);
              }
            }}
            style={{
              borderWidth: 0.5,
              width: '70%',
              borderRadius: 10,
              aspectRatio: aspectRatio,
            }}
          />
          <View
            style={{
              position: 'absolute',
              backgroundColor: 'black',
              borderRadius: 100,
              padding: 8,
              zIndex: 999,
            }}>
            <TouchableOpacity onPress={() => setPaused(!paused)}>
              <AntDesignIcons
                name={paused ? 'play' : 'pause'}
                color={presetBase.colors.white}
                size={50}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default VideoPlayerComponent;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end', // Adjust this as needed
    marginBottom: 200, // Adjust this as needed to create spacing between bubbles
  },
});
