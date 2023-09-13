import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import * as ImagePicker from 'react-native-image-picker';
import {ImagePickerResponse} from 'react-native-image-picker/src/types';
import {Asset} from 'react-native-image-picker';
import {presetBase} from '../../utils/color';
import Video from 'react-native-video';

const SendVideoComponent = ({navigation}: any) => {
  const [videoUri, setVideoUri] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const [paused, setPaused] = useState(true);

  const onVideoSelectedFromDevice = useCallback(
    async (result: ImagePickerResponse) => {
      if (result?.assets !== undefined) {
        console.log(result);
        setVideoUri(result.assets);
        setLoading(false);
      }
    },
    [],
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
              source={{uri: videoUri[0].uri}} // Can be a URL or a local file.
              ref={ref => {}} // Store reference
              // Callback when video cannot be loaded
              style={{
                borderWidth: 2,
                width: '70%',
                // height: videoUri[0].height,
                aspectRatio: videoUri[0].width / videoUri[0].height,
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
});
