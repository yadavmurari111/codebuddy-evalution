import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
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
import {TwilioVideo} from 'react-native-twilio-video-webrtc';
import ElapsedTimeInSeconds from './callTimer';
import {
  callEndedSoundPlay,
  deleteFirestoreCallData,
  updateMuteStatusToFirestore,
} from './CallFunctions';
import {useAuth} from '../AuthProvider';
import ROUTE_NAME from '../navigation/navigation-constants';
import database from '@react-native-firebase/database';

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

  const onEndCall = () => {
    // if (status === 'disconnected') {
    //   return;
    // }

    callEndedSoundPlay();
    setStatus('disconnected');
    twilioRef.current?.disconnect();
    deleteFirestoreCallData(chat_id, recipient_uid, caller_uid);

    navigation.navigate(ROUTE_NAME.CHAT_SCREEN);
  };
  const {
    user: {chat_id},
  } = useAuth();

  const onMuteButtonPress = () => {
    twilioRef.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(async isEnabled => {
        setIsAudioEnabled(isEnabled);
        updateMuteStatusToFirestore(
          !isEnabled,
          isCalling,
          chat_id,
          recipient_uid,
          caller_uid,
        );
      });
  };

  const toggleSoundSetup = () => {
    setIsSpeakerMode(!isSpeakerMode);
    twilioRef.current.toggleSoundSetup(isSpeakerMode);
  };

  const onConnectTwilio = token => {
    twilioRef.current.connect({
      accessToken: token,
      enableVideo: false,
      enableAudio: true,
    });
  };

  // connect call to Twilio room
  useEffect(() => {
    onConnectTwilio(accessToken);
    toggleSoundSetup();
  }, []);

  // At the time of unmounting the component end call
  // useEffect(() => {
  //   return () => {
  //     onEndCall();
  //   };
  // }, []);

  const [isFriendMute, setIsFriendMute] = useState(false);
  const [callTimer, setCallTimer] = useState(null);

  const selfUid = isCalling ? caller_uid : recipient_uid;
  const friendUid = !isCalling ? caller_uid : recipient_uid;

  // this listener is for "call disconnected" by friend
  useEffect(() => {
    const databaseRef = database().ref(
      `chat/${chat_id}/watchers/${recipient_uid}/incoming-call/caller/${caller_uid}`,
    );

    // Add a real-time listener to the root collection
    const onValueChange = databaseRef.on('value', async snapshot => {
      const newData = snapshot.val();
      console.log(newData, 'newData in call-detail');

      if (newData === null) {
        onEndCall();
        return;
      }

      const muteData = !isCalling
        ? newData.isCallerMute
        : newData.isRecipientMute;
      setIsFriendMute(muteData);
      setCallTimer(newData.callConnectedTime);
    });
    return () => {
      databaseRef.off('value', onValueChange); // Unsubscribe the listener when the component unmounts
    };
  }, []);

  console.log('selfUid :  -', isCalling ? caller_uid : recipient_uid);

  // useEffect(() => {
  //   const IsInCallRef = database().ref(
  //     `users/${selfUid}/watchers/incoming-call/caller/isInCall/inCall`,
  //   );
  //   const IsFriendInCallRef = database().ref(
  //     `users/${friendUid}/watchers/incoming-call/caller/isInCall/inCall`,
  //   );
  //
  //   // Add a real-time listener to the root collection
  //   const onValueChange = IsInCallRef.on('value', async snapshot => {
  //     const IsInCall = snapshot.val();
  //     !IsInCall ? onEndCall() : {}; // when friend disconnect the call , end call from my side
  //   });
  //
  //   const onChange = IsFriendInCallRef.on('value', async snapshot => {
  //     const IsInCall = snapshot.val();
  //     console.log(IsInCall, '=============is in call');
  //     console.log(friendUid, '=============friendUid============');
  //     !IsInCall ? onEndCall() : {}; // when friend disconnect the call , end call from my side
  //   });
  //
  //   return () => {
  //     IsInCallRef.off('value', onValueChange);
  //     IsFriendInCallRef.off('value', onChange);
  //   };
  // }, []);

  return (
    <AnimatedTouchableWithoutFeedback onPress={handleTapIn}>
      <View style={styles.container}>
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
          <TouchableOpacity
            onPress={onMuteButtonPress}
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: isAudioEnabled ? '#eee' : 'grey',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesignIcons
              size={40}
              name={isAudioEnabled ? 'mic' : 'mic-off'}
              color={isAudioEnabled ? 'grey' : 'lightgrey'}
            />
          </TouchableOpacity>
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
            onPress={onEndCall} // on end
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: '#f13906',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={require('./call-assets/call.png')}
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
          {status === 'connected' && (
            <ElapsedTimeInSeconds startTimestamp={callTimer} />
          )}
          {status === 'disconnected' && (
            <Text style={{textAlign: 'center', color: 'white'}}>
              connecting...
            </Text>
          )}
          <Animated.View style={[{position: 'absolute', top: 0}]}>
            <SmallWindow
              animation={animation}
              isFriendMute={isFriendMute}
              friendUid={friendUid}
            />
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

const SmallWindow = ({animation, friendUid, isFriendMute}) => {
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
            source={require('./call-assets/test_avatar.png')}
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
          <Text style={{fontWeight: 'bold', color: 'black', marginTop: 2}}>
            {friendUid}
          </Text>
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