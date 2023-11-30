import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Animated, {
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {SharedElement} from 'react-navigation-shared-element';
import {useIsFocused} from '@react-navigation/native';
import {animationRef} from '../../App';
import Sound from 'react-native-sound';
import callHangup from './call-assets/call-hang-up.mp3';
import ROUTE_NAME from '../navigation/navigation-constants';
import {
  callEndedSoundPlay,
  deleteFirestoreCallData,
  IncomingCallRingtonePlay,
  IncomingCallRingtoneStop,
  updateCallDataFirestore,
} from './CallFunctions';
import database from '@react-native-firebase/database';
import {useAuth} from '../AuthProvider';

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);
const {width, height} = Dimensions.get('window');
const CONTAINER_HEIGHT = height * 0.65;
const CONTAINER_WIDTH = width;
const IMAGE_SIZE = CONTAINER_WIDTH * 0.5;
export const ACTION_CONTAINER_WIDTH = CONTAINER_WIDTH * 0.85;
const ACTION_CONTAINER_B_WIDTH = ACTION_CONTAINER_WIDTH - 50;
const ACTION_BUTTON_WIDTH = ACTION_CONTAINER_WIDTH * 0.4;
const ACTION_BUTTON_HEIGHT = 50;
const DURATION = 2000;

const CallHangup = new Sound(callHangup);

const IncomingCall = ({navigation, route}) => {
  const {
    data: {tokenToJoinRoom, caller_uid, recipient_uid},
  } = route.params || {};

  const {
    user: {chat_id},
  } = useAuth();

  const [state, setstate] = useState(true);
  const [state2, setStateAccept] = useState(true);

  useEffect(() => {
    IncomingCallRingtonePlay();
  }, []);

  const onNavigate = async () => {
    // Object.keys(animationRef.current).forEach((key) => {
    //     cancelAnimation(animationRef.current[key])
    // })
    IncomingCallRingtoneStop();
    updateCallDataFirestore(chat_id, recipient_uid, caller_uid); // update firestore call status for friend == connecting

    setstate(false);
    acceptAnimatedValue.value = withTiming(1, {duration: 500}, () => {
      translateY.value = withDelay(
        200,
        withTiming(500, {duration: 500}, () => {
          runOnJS(navigation.navigate)(ROUTE_NAME.VIDEO_CALL_DETAIL, {
            isCalling: false,
            caller_uid: caller_uid,
            recipient_uid: recipient_uid,
            accessToken: tokenToJoinRoom,
          });
        }),
      );
    });
  };

  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const focused = useIsFocused();

  const onReject = () => {
    IncomingCallRingtoneStop();
    callEndedSoundPlay();
    deleteFirestoreCallData(chat_id, recipient_uid, caller_uid);
    console.log('user dismissed call!');
  };

  // run at the time of unmounting
  useEffect(() => {
    return () => {
      onReject(); // when user swipe down incoming screen trigger this
    };
  }, []);

  useEffect(() => {
    if (focused) {
      setstate(true);
      let ref = setTimeout(() => {
        translateY.value = withTiming(0, {duration: 500});
        clearTimeout(ref);
      }, 200);
    }
  }, [focused]);

  const acceptAnimatedValue = useSharedValue(0);
  const rejectAnimatedValue = useSharedValue(0);

  const animatedStyleAccept = useAnimatedStyle(() => {
    return {
      width: interpolate(
        acceptAnimatedValue.value,
        [0, 1],
        [ACTION_BUTTON_WIDTH, ACTION_CONTAINER_B_WIDTH],
      ),
      opacity: interpolate(rejectAnimatedValue.value, [0, 1], [1, 0]),
      transform: [
        {scale: interpolate(rejectAnimatedValue.value, [0, 1], [1, 0.5])},
      ],
    };
  });

  useEffect(() => {
    const databaseRef = database().ref(
      `chat/${chat_id}/watchers/${recipient_uid}/incoming-call/caller/${caller_uid}`,
    );

    // Add a real-time listener to the root collection
    const onValueChange = databaseRef.on('value', async snapshot => {
      const newData = snapshot.val();
      if (newData === null) {
        navigation.navigate(ROUTE_NAME.CHAT_SCREEN);
      }
    });

    return () => {
      databaseRef.off('value', onValueChange);
    };
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'flex-end'}}>
      <View
        style={{
          height: CONTAINER_HEIGHT,
          backgroundColor: 'transparent',
          // backgroundColor: '#78558f',
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          justifyContent: 'space-around',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
        <SharedElement id="callContainer" style={StyleSheet.absoluteFill}>
          <Image
            source={require('./call-assets/ss.png')}
            style={[
              StyleSheet.absoluteFillObject,
              {width: '100%', height: '100%', tintColor: '#78558f'},
            ]}
            resizeMode="stretch"
          />
        </SharedElement>
        <View>
          <UserImage waveEnable={state} />
        </View>
        <Text style={{fontSize: 16, color: 'white', fontWeight: '700'}}>
          {caller_uid} calling you...
        </Text>

        <Animated.View
          style={[
            {
              width: ACTION_CONTAINER_WIDTH,
              alignSelf: 'center',
              // padding: 10,
              paddingVertical: 15,
              borderRadius: 10,
              backgroundColor: '#00000020',
              flexDirection: 'row',
              justifyContent: 'space-around',
            },
            animatedStyle,
          ]}>
          <View
            style={{
              width: ACTION_CONTAINER_B_WIDTH,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            {state2 ? (
              <AnimatedTouch
                exiting={FadeOut}
                style={[
                  {
                    width: ACTION_BUTTON_WIDTH,
                    height: ACTION_BUTTON_HEIGHT,
                    borderRadius: ACTION_BUTTON_WIDTH / 2,
                    backgroundColor: '#2a9c3f',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  animatedStyleAccept,
                ]}
                onPress={onNavigate}>
                <Image
                  source={require('./call-assets/call.png')}
                  style={styles.call}
                  resizeMode="contain"
                />
              </AnimatedTouch>
            ) : (
              <Animated.View style={{width: ACTION_BUTTON_WIDTH}} />
            )}
            {state ? (
              <AnimatedTouch
                onPress={() => navigation.goBack()} //on reject
                exiting={FadeOut}
                style={[
                  {
                    width: ACTION_BUTTON_WIDTH,
                    height: ACTION_BUTTON_HEIGHT,
                    borderRadius: ACTION_BUTTON_WIDTH / 2,
                    backgroundColor: '#eee',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}>
                <Image
                  source={require('./call-assets/close.png')}
                  style={{tintColor: 'gray', width: 20, height: 20}}
                  resizeMode="contain"
                />
              </AnimatedTouch>
            ) : (
              <View style={{width: ACTION_BUTTON_WIDTH}} />
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default IncomingCall;

const styles = StyleSheet.create({
  call: {width: 30, height: 30, tintColor: '#fff'},
});

export const UserImage = ({waveEnable = false, width, height}) => {
  return (
    <SharedElement id="userImage">
      <View
        style={{
          backgroundColor: '#ccc',
          borderRadius: IMAGE_SIZE / 2,
          zIndex: 1000,
        }}>
        {!!waveEnable && (
          <>
            <WaveCircle index={0} />
            <WaveCircle index={1} />
            <WaveCircle index={2} />
          </>
        )}
        <Image
          style={{
            width: width || IMAGE_SIZE,
            height: height || IMAGE_SIZE,
            borderRadius: IMAGE_SIZE / 2,
            backgroundColor: '#ccc',
          }}
          //source={require('../../assets/test_avatar.png')}
          source={require('./call-assets/test_avatar.png')}
          // source={{
          //   uri: 'https://dyl347hiwv3ct.cloudfront.net/app/uploads/2023/09/img-favicon.png',
          // }}
        />
      </View>
    </SharedElement>
  );
};

const WaveCircle = ({index}) => {
  const scale = useSharedValue(0);
  useEffect(() => {
    setTimeout(() => {
      animationRef.current[index] = scale;
      scale.value = withRepeat(withTiming(1, {duration: DURATION}), -1);
    }, index * 500);
  }, []);

  const style = useAnimatedStyle(() => {
    return {
      transform: [{scale: interpolate(scale.value, [0, 1], [1, 1.5])}],
      opacity: interpolate(scale.value, [0, 1], [1, 0]),
    };
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {backgroundColor: '#00000090', borderRadius: IMAGE_SIZE},
        style,
      ]}
    />
  );
};