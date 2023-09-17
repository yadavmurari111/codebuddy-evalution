import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import {Asset} from 'react-native-image-picker';
import {ImagePickerResponse} from 'react-native-image-picker/src/types';
import {presetBase} from '../../utils/color';
import Video from 'react-native-video';
import ROUTE_NAME from '../../navigation/navigation-constants';

const SendVideoComponent = ({navigation}: any) => {
  const videoRef = useRef(null);

  const [videoUri, setVideoUri] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(true);
  const {uri} = videoUri.length > 0 ? videoUri[0] : {uri: ''};
  const aspectRatio = 1;

  const showAlert = (assets: Asset[]) => {
    Alert.alert(
      'Video longer than 30 seconds!',
      'Navigate to video trim screen ?',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate(ROUTE_NAME.VIDEO_TRIM_SCREEN, {
              videoData: assets,
            });
          },
        },
      ],
      {cancelable: false}, // Prevents dismissing the alert by tapping outside of it
    );
  };

  const onVideoSelectedFromDevice = useCallback(
    async (result: ImagePickerResponse) => {
      if (result?.assets !== undefined) {
        console.log(result);
        setVideoUri(result.assets);
        setLoading(false);
        if (
          result?.assets[0].duration !== undefined &&
          result.assets[0].duration > 30
        ) {
          // navigate to trim screen if duration is more than 30 sec
          showAlert(result.assets);
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
    setLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        height: 100,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'lightgrey',
      }}>
      <View style={{justifyContent: 'center'}}>
        <TouchableOpacity onPress={onAddVideo}>
          <AntDesignIcons name={'camera'} color={'blue'} size={50} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {loading && <ActivityIndicator size={'small'} color={'blue'} />}
        {videoUri.length > 0 && (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Video
              paused={paused}
              resizeMode={'cover'}
              source={{uri: uri}} // Can be a URL or a local file.
              onLoad={() => {
                if (videoRef.current) {
                  videoRef.current.seek(0);
                }
              }}
              style={{
                borderWidth: 0.5,
                width: 70,
                borderRadius: 10,
                aspectRatio: aspectRatio,
              }}
            />
            <View
              style={{
                position: 'absolute',
                backgroundColor: 'black',
                zIndex: 999,
              }}>
              <TouchableOpacity onPress={() => setPaused(!paused)}>
                <AntDesignIcons
                  name={paused ? 'play' : 'pause'}
                  color={presetBase.colors.white}
                  size={30}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.sendButtonContainer}>
        <TouchableOpacity>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SendVideoComponent;

const styles = StyleSheet.create({
  container: {
    marginLeft: '35%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2, // Adjust this as needed to create spacing between bubbles
  },
  sendButtonContainer: {
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
