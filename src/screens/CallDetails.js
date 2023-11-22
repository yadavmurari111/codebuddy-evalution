import {
  Alert,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {SharedElement} from 'react-navigation-shared-element';
import {UserImage} from './IncomingCall';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import AntDesignIcons from 'react-native-vector-icons/Ionicons';
import ROUTE_NAME from '../navigation/navigation-constants';
import {TwilioVideo} from 'react-native-twilio-video-webrtc';
import {firebase} from '@react-native-firebase/firestore';
import Mute from '../assets/incoming-call-assets/mute';
import callHangup from '../assets/incoming-call-assets/call-hang-up.mp3';
import callRingtone from '../assets/incoming-call-assets/call-ringtone.mp3';
import Sound from 'react-native-sound';
import ElapsedTimeInSeconds from './callTimer';
import {deleteFirestoreCallData} from './callFunctions';

const CallHangup = new Sound(callHangup);
const CallRingtone = new Sound(callRingtone);

export const callEndPlay = () => {
  CallHangup.play(success => console.log(success));
};

export const callRingtonePlay = () => {
  console.log('callRingtonePlay!');
  CallRingtone.play(success => console.log(success));
};

export const callRingtoneStop = () => {
  CallRingtone.stop(success => console.log(success));
};

const AnimatedTouchableWithoutFeedback = Animated.createAnimatedComponent(
  TouchableWithoutFeedback,
);

const {width, height} = Dimensions.get('window');
const ACTION_CONTAINER_MARGIN_TOP = 10;
const ACTION_CONTAINER_HEIGHT = 90;
const ACTION_CONTAINER_WIDTH = width - ACTION_CONTAINER_MARGIN_TOP * 2;

const CallDetails = ({navigation, route}) => {
  const {isCalling, accessToken, recipient_uid, caller_uid} =
    route.params || {};

  console.log(recipient_uid, '---recipient_uid---');
  console.log(caller_uid, '---caller_uid---');

  const animation = useSharedValue(0);
  const animatedStyleTop = useAnimatedStyle(() => {
    return {
      marginTop: interpolate(
        animation.value,
        [0, 1],
        [ACTION_CONTAINER_MARGIN_TOP, -ACTION_CONTAINER_HEIGHT],
      ),
      // transform: [{ translateY: interpolate(animation.value, [0, 1], [0, -translateValue]) }]
    };
  });

  const animate = (val, delay = 500) => {
    'worklet';
    animation.value = withDelay(delay, withTiming(val, {duration: 500}));
  };

  useEffect(() => {
    onInit();
  }, []);

  const onInit = () => {
    let time = setTimeout(() => {
      animate(1);
      clearTimeout(time);
    }, 3000);
  };

  const handleTapIn = () => {
    'worklet';
    // /   animate(0, 0)
    animate(Number(!animation.value), 0);
  };
  const handleTapOut = () => {
    'worklet';
    animate(1, 5000);
  };

  const twilioRef = useRef(null);

  const [status, setStatus] = useState('disconnected');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerMode, setIsSpeakerMode] = useState(true);

  const onRoomConnect = ({roomName, error}) => {
    console.log('onRoomDidConnect: ', roomName);
    console.log('[onRoomDidConnect]ERROR: ', error);
    //Alert.alert('room connected');

    setStatus('connected');
  };

  const onRoomDisconnect = ({roomName, error}) => {
    console.log('[ Disconnect ] -', roomName);
  };

  const onRoomFailToConnect = error => {
    console.log('[FailToConnect]ERROR: ', error);
  };

  const onEndButtonPress = async () => {
    if (status === 'disconnected') {
      return;
    }
    callRingtoneStop();
    callEndPlay();

    twilioRef.current.disconnect();
    await deleteFirestoreCallData(recipient_uid, caller_uid);
    setStatus('disconnected');
    navigation.navigate(ROUTE_NAME.CHAT_SCREEN);
  };

  const onMuteButtonPress = isMute => {
    console.log(isMute, '---isMute---');
    twilioRef.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(async isEnabled => {
        setIsAudioEnabled(isEnabled);
        await updateMuteStatusToFirestore(!isEnabled);
      });
  };

  const toggleSoundSetup = () => {
    setIsSpeakerMode(!isSpeakerMode);
    twilioRef.current.toggleSoundSetup(isSpeakerMode);
  };

  // const deleteFirestoreCallData = async caller_uid => {
  //   const db = firebase.firestore();
  //
  //   const collectionRef = db
  //     .collection('users')
  //     .doc(!isCalling ? selfUid : friendUid)
  //     .collection('watchers')
  //     .doc('incoming-call')
  //     .collection('calls')
  //     .doc(caller_uid);
  //
  //   try {
  //     await collectionRef.delete();
  //     console.log('Call status updated successfully!');
  //   } catch (error) {
  //     console.error('Error updating call status: ', error);
  //   }
  // };

  const updateMuteStatusToFirestore = async muteStatus => {
    const db = firebase.firestore();
    const updateCallerMuteData = {
      isCallerMute: muteStatus,
    };
    const updateRecipientMuteData = {
      isRecipientMute: muteStatus,
    };
    const updateData = isCalling
      ? updateCallerMuteData
      : updateRecipientMuteData;
    const collectionRef = db
      .collection('users')
      .doc(recipient_uid)
      .collection('watchers')
      .doc('incoming-call')
      .collection('calls')
      .doc(caller_uid);

    try {
      await collectionRef.update(updateData);
      console.log('Call Mute status updated successfully!');
    } catch (error) {
      console.error('Error updating call status: ', error);
    }
  };

  const onConnectTwilio = token => {
    twilioRef.current.connect({
      accessToken: token,
      enableVideo: false,
    });
    // Alert.alert('' + token);
    setStatus('connected');
  };

  // connect call to Twilio room
  useEffect(() => {
    onConnectTwilio(accessToken);
  }, []);

  // At the time of unmounting the component end call
  useEffect(() => {
    return () => {
      onEndButtonPress().then(() => console.log('call ended'));
    };
  }, []);

  const [isFriendMute, setIsFriendMute] = useState(false);
  const [callTimer, setCallTimer] = useState(null);

  //isCalling ? friendUid : selfUid

  // this listener is for "call disconnected" by friend
  useEffect(() => {
    const db = firebase.firestore();
    const rootCollectionRef = db
      .collection('users')
      .doc(recipient_uid)
      .collection('watchers')
      .doc('incoming-call')
      .collection('calls')
      .doc(caller_uid);
    // Add a real-time listener to the root collection
    const unsubscribe = rootCollectionRef.onSnapshot(async snapshot => {
      // Process the changes here
      console.log(snapshot, '--snapshot data-- in detail screen');

      if (snapshot._exists === false) {
        await onEndButtonPress();
      }

      setCallTimer(snapshot._data.callConnectedTime);

      setIsFriendMute(
        !isCalling
          ? snapshot._data.isCallerMute
          : snapshot._data.isRecipientMute,
      );
    });
    return () => {
      unsubscribe(); // Unsubscribe the listener when the component unmounts
    };
  }, []);

  useEffect(() => {
    const db = firebase.firestore();
    const rootCollectionRef = db
      .collection('users')
      .doc(recipient_uid)
      .collection('watchers')
      .doc('incoming-call')
      .collection('calls');

    // Add a real-time listener to the root collection
    const unsubscribe = rootCollectionRef.onSnapshot(snapshot => {
      if (snapshot._exists === false) {
        return;
      }

      //Check if the user is already in a call
      const isInCall = snapshot?.docs.some(
        doc => doc.data()?.callStatus === 'connected',
      );
      console.log(isInCall, '==isInCall===');
      console.log(snapshot?._docs, '==snapshot?._docs ===');

      const anotherPersonCallingData = snapshot?._docs[1]?._data;

      if (isInCall && anotherPersonCallingData?.callStatus === 'calling') {
        // Alert.alert('Incoming call!', 'Please take an action', [
        //   {text: 'accept'},
        //   {
        //     text: 'reject',
        //     onPress: async () => {
        //       await deleteFirestoreCallData(
        //         anotherPersonCallingData.caller_uid,
        //       );
        //     },
        //   },
        // ]);
      }
    });
    return () => {
      // Unsubscribe the listener when the component unmounts
      unsubscribe();
    };
  }, []);

  return (
    <AnimatedTouchableWithoutFeedback onPress={handleTapIn}>
      <View style={styles.container}>
        <SharedElement id="callContainer" style={StyleSheet.absoluteFill}>
          <Image
            source={require('../../src/assets/incoming-call-assets/ss.png')}
            style={[
              StyleSheet.absoluteFillObject,
              {width: '100%', height: '100%', tintColor: '#78558f'},
            ]}
            resizeMode="stretch"
          />
        </SharedElement>
        {/* <Animated.View style={[animatedStyleHeight]} > */}
        <Animated.View
          style={[
            {
              width: ACTION_CONTAINER_WIDTH,
              alignSelf: 'center',
              padding: 10,
              paddingVertical: 15,
              borderRadius: 10,
              backgroundColor: '#00000020',
              flexDirection: 'row',
              marginTop: ACTION_CONTAINER_MARGIN_TOP,
              height: ACTION_CONTAINER_HEIGHT,
              alignItems: 'center',
              justifyContent: 'space-around',
            },
            animatedStyleTop,
          ]}>
          <UserImage width={70} height={70} />
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: '#eee',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Mute muteButtonHandler={onMuteButtonPress} />
            {/*<AntDesignIcons name={'mic'} color={'black'} size={30} />*/}
          </View>
          <TouchableOpacity
            onPress={toggleSoundSetup}
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: !isSpeakerMode ? '#eee' : 'grey',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesignIcons
              size={40}
              name="volume-high"
              color={!isSpeakerMode ? 'grey' : 'lightgrey'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEndButtonPress}
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: '#f13906',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={require('../../src/assets/incoming-call-assets/call.png')}
              style={[
                {
                  width: 30,
                  height: 30,
                  tintColor: '#fff',
                  transform: [{rotate: '135deg'}],
                },
              ]}
              resizeMode="stretch"
            />
          </TouchableOpacity>
        </Animated.View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          {callTimer !== null && (
            <ElapsedTimeInSeconds startTimestamp={callTimer} />
          )}

          <Animated.View style={[{position: 'absolute', top: 0}]}>
            <SmallWindow animation={animation} isFriendMute={isFriendMute} />
          </Animated.View>
        </View>
        <TwilioVideo
          ref={twilioRef}
          onRoomDidConnect={onRoomConnect}
          onRoomDidDisconnect={onRoomDisconnect}
          onRoomDidFailToConnect={onRoomFailToConnect}
        />
      </View>
    </AnimatedTouchableWithoutFeedback>
  );
};

export default CallDetails;

CallDetails.sharedElements = (navigation, otherNavigation, showing) => {
  return [{id: 'callContainer'}, {id: 'userImage'}];
};

const SMALL_WINDOW_WIDTH = width * 0.29;
const SMALL_WINDOW_HEIGHT = width * 0.29 * 1.6;
const POSITION_LEFT = 0;
const POSITION_RIGHT =
  width - SMALL_WINDOW_WIDTH - ACTION_CONTAINER_MARGIN_TOP * 2;
const POSITION_BOTTOM =
  height -
  SMALL_WINDOW_HEIGHT -
  ACTION_CONTAINER_MARGIN_TOP * 2 -
  StatusBar.currentHeight;
const POSITION_TOP = 0;

const SmallWindow = ({animation, isFriendMute}) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const positionY = useSharedValue('bottom');
  const positionX = useSharedValue('left');
  const panResponder = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      'worklet';
      ctx.startX = x.value;
      ctx.startY = y.value;
    },
    onActive: (event, ctx) => {
      'worklet';
      x.value = ctx.startX + event.translationX / 2;
      y.value = ctx.startY + event.translationY / 2;
    },
    onEnd: (evt, ctx) => {
      'worklet';
      let translateX = evt.translationX;
      let translateY = evt.translationY;

      const getPositive = (num = 0) => {
        'worklet';
        if (num < 0) {
          return num * -1;
        } else {
          return num;
        }
      };
      if (
        positionY.value == 'bottom' &&
        getPositive(translateY) >= height * 0.4
      ) {
        y.value = withTiming(
          POSITION_TOP,
          {duration: 500, easing: Easing.elastic()},
          () => {
            positionY.value = 'top';
          },
        );
      }
      if (
        getPositive(translateY) < height * 0.4 &&
        positionY.value == 'bottom'
      ) {
        y.value = withTiming(POSITION_BOTTOM, {
          duration: 500,
          easing: Easing.elastic(),
        });
      }
      if (positionY.value == 'top' && getPositive(translateY) >= height * 0.4) {
        y.value = withTiming(
          POSITION_BOTTOM,
          {duration: 500, easing: Easing.elastic()},
          () => {
            positionY.value = 'bottom';
          },
        );
      }
      if (getPositive(translateY) < height * 0.4 && positionY.value == 'top') {
        y.value = withTiming(POSITION_TOP, {
          duration: 500,
          easing: Easing.elastic(),
        });
      }

      if (positionX.value == 'left' && getPositive(translateX) >= width / 2) {
        x.value = withTiming(
          POSITION_RIGHT,
          {duration: 500, easing: Easing.elastic()},
          () => {
            positionX.value = 'right';
          },
        );
      }
      if (getPositive(translateX) < width / 2 && positionX.value == 'left') {
        x.value = withTiming(POSITION_LEFT, {
          duration: 500,
          easing: Easing.elastic(),
        });
      }
      if (positionX.value == 'right' && getPositive(translateX) >= width / 2) {
        x.value = withTiming(
          POSITION_LEFT,
          {duration: 500, easing: Easing.elastic()},
          () => {
            positionX.value = 'left';
          },
        );
      }
      if (getPositive(translateX) < width / 2 && positionX.value == 'right') {
        x.value = withTiming(POSITION_RIGHT, {
          duration: 500,
          easing: Easing.elastic(),
        });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: x.value,
        },
        {
          translateY: y.value,
        },
      ],
    };
  });
  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={panResponder}>
        <Animated.View
          entering={FadeIn.delay(500)}
          style={[styles.smallWindow, animatedStyle]}>
          <Image
            source={require('../../src/assets/incoming-call-assets/test_avatar.png')}
            style={{
              width: SMALL_WINDOW_WIDTH * 0.5,
              height: SMALL_WINDOW_WIDTH * 0.5,
              borderWidth: 1,
              borderColor: '#000',
              borderRadius: 100,
            }}
          />
          <AntDesignIcons
            style={{marginTop: 2}}
            name={isFriendMute ? 'mic-off' : 'mic'}
            color={'black'}
            size={18}
          />
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  smallWindow: {
    width: SMALL_WINDOW_WIDTH,
    height: SMALL_WINDOW_HEIGHT,
    backgroundColor: '#37b9ff',
    borderRadius: 10,
    margin: ACTION_CONTAINER_MARGIN_TOP,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
