import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import {ImagePickerResponse} from 'react-native-image-picker/src/types';
import {presetBase} from '../../utils/color';
import Video from 'react-native-video';
import {showEditor} from 'react-native-video-trim';
import {compressVideo} from '../../utils/utils';

const SendVideoComponent: FunctionComponent<any> = () => {
  const videoRef = useRef(null);

  const [videoUri, setVideoUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(true);
  const aspectRatio = 1;

  const showAlert = (uri: string) => {
    Alert.alert(
      'Video longer than 30 seconds!',
      'Navigate to video trim screen ?',
      [
        {
          text: 'OK',
          onPress: async () => {
            await showEditor(uri || '', {maxDuration: 30});
          },
        },
        {
          text: 'cancel',
        },
      ],
      {cancelable: false}, // Prevents dismissing the alert by tapping outside of it
    );
  };

  const onVideoSelectedFromDevice = useCallback(
    async (result: ImagePickerResponse) => {
      if (
        result?.assets !== undefined &&
        result?.assets[0].duration !== undefined
      ) {
        console.log(result, 'result');
        if (result.assets[0].duration > 30) {
          showAlert(result.assets[0].uri || '');
        } else {
          setLoading(true);
          compressVideo(result.assets[0].uri || '').then(compressVideoUrl => {
            setVideoUri(compressVideoUrl);
            setLoading(false);
          });
        }
      }
    },
    [],
  );

  const onAddVideo = async () => {
    setLoading(true);
    setVideoUri('');
    await ImagePicker.launchImageLibrary(
      {mediaType: 'video'},
      onVideoSelectedFromDevice,
    );
    setLoading(false);
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener('VideoTrim', event => {
      switch (event.name) {
        case 'onShow': {
          console.log('onShowListener', event);
          break;
        }
        case 'onHide': {
          console.log('onHide', event);
          break;
        }
        case 'onStartTrimming': {
          setLoading(true);
          console.log('onStartTrimming', event);
          break;
        }
        case 'onFinishTrimming': {
          console.log('onFinishTrimming', event);
          compressVideo(event.outputPath).then(compressVideoUrl => {
            setVideoUri(compressVideoUrl);
            setLoading(false);
          });
          break;
        }
        case 'onCancelTrimming': {
          console.log('onCancelTrimming', event);
          break;
        }
        case 'onError': {
          console.log('onError', event);
          break;
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
              source={{uri: videoUri}} // Can be a URL or a local file.
              onLoad={() => {
                if (videoRef.current) {
                  // @ts-ignore
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
