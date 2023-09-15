import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Slider,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import * as ImagePicker from 'react-native-image-picker';
import {ImagePickerResponse} from 'react-native-image-picker/src/types';
import {Asset} from 'react-native-image-picker';
import {presetBase} from '../../utils/color';
import Video from 'react-native-video';
import ROUTE_NAME from '../../navigation/navigation-constants';

const SendVideoComponent = ({navigation}: any) => {
  const [videoUri, setVideoUri] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(true);
  const {uri, width, height} =
    videoUri.length > 0 ? videoUri[0] : {uri: '', width: 0, height: 0};
  const aspectRatio = width / height;

  const onVideoSelectedFromDevice = useCallback(
    async (result: ImagePickerResponse) => {
      if (result?.assets !== undefined) {
        console.log(result);
        setVideoUri(result.assets);
        setLoading(false);
        if (
          result?.assets[0].duration !== undefined &&
          result.assets[0].duration > 10
        ) {
          navigation.navigate(ROUTE_NAME.VIDEO_TRIM_SCREEN, {
            videoData: result.assets,
          });
        }
      }
    },
    [navigation],
  );

  const onAddVideo = async () => {
    setLoading(true);
    await ImagePicker.launchImageLibrary(
      {mediaType: 'video'},
      onVideoSelectedFromDevice,
    );
  };

  return (
    <View style={{flex: 1, padding: 10, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onAddVideo}>
          <AntDesignIcons name={'camera'} color={'blue'} size={50} />
        </TouchableOpacity>
        {loading && <ActivityIndicator size={'small'} color={'blue'} />}
        {videoUri.length > 0 && (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Video
              paused={paused}
              resizeMode={'stretch'}
              source={{uri: uri}} // Can be a URL or a local file.
              style={{
                borderWidth: 2,
                width: '85%',
                aspectRatio: aspectRatio,
                borderRadius: 12,
              }}
            />
            <View style={{position: 'absolute', zIndex: 999}}>
              <TouchableOpacity onPress={() => setPaused(!paused)}>
                <AntDesignIcons
                  name={paused ? 'play' : 'pause'}
                  color={presetBase.colors.black}
                  size={60}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default SendVideoComponent;

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
    marginTop: 20,
    alignItems: 'center',
  },
  slider: {
    width: 250,
  },
  trimButton: {
    marginTop: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
});
