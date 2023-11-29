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
import React, {useEffect, useState} from 'react';
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
import {firebase} from '@react-native-firebase/firestore';
import {
  callEndPlay,
  callRingtonePlay,
  callRingtoneStop,
  deleteFirestoreCallData,
  getToken,
} from './CallFunctions';

const AnimatedTouchableWithoutFeedback = Animated.createAnimatedComponent(
  TouchableWithoutFeedback,
);

const {width, height} = Dimensions.get('window');
const ACTION_CONTAINER_MARGIN_TOP = 10;
const ACTION_CONTAINER_HEIGHT = 90;
const ACTION_CONTAINER_WIDTH = width - ACTION_CONTAINER_MARGIN_TOP * 2;

const CallOutGoing = ({navigation, route}) => {
  const {caller_uid, recipient_uid} = route.params || {};

  const animation = useSharedValue(0);
  const animatedStyleTop = useAnimatedStyle(() => {
    return {
      marginTop: interpolate(
        animation.value,
        [0, 1],
        [ACTION_CONTAINER_MARGIN_TOP, -ACTION_CONTAINER_HEIGHT],
      ),
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
    animate(Number(!animation.value), 0);
  };

  const navigateToCallDetail = async () => {
    console.log('call accepted by friend!');
    setIsCallAccepted(true);
    callRingtoneStop();

    const roomName = 'room-' + caller_uid + '-' + recipient_uid;
    const tokenForMe = await getToken(roomName, caller_uid); // caller_uid is self_uid
    navigation.navigate(ROUTE_NAME.VIDEO_CALL_DETAIL, {
      isCalling: true,
      caller_uid: caller_uid,
      recipient_uid: recipient_uid,
      accessToken: tokenForMe,
    });
  };

  const [isCallAccepted, setIsCallAccepted] = useState(false);

  // listener for friend's/recipient's actions (accepted /rejected etc)
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
      console.log(snapshot);
      console.log(recipient_uid, caller_uid);
      console.log('recipient_uid', 'caller_uid');
      if (snapshot?._data?.callStatus) {
        switch (snapshot?._data?.callStatus) {
          case 'connected':
            setIsCallAccepted(true);
            await navigateToCallDetail();
            break;
        }
      }
      if (snapshot._exists === false) {
        await onEndButtonPress();
      }
    });

    return () => {
      unsubscribe(); // Unsubscribe the listener when the component unmounts
    };
  }, []);

  const onEndButtonPress = async () => {
    callRingtoneStop();
    callEndPlay();

    setIsCallAccepted(false);

    await deleteFirestoreCallData(recipient_uid, caller_uid);
    navigation.goBack();
  };

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    callRingtonePlay(); // Code to run on mount

    const startTimer = () => {
      const intervalId = setInterval(() => {}, 1000);
      setTimer(intervalId); // Save the interval ID in state to clear it later
    };
    startTimer(); // Call the startTimer function

    if (timer > 30) {
      clearInterval(timer);
      onEndButtonPress().then(() =>
        console.log('user dismissed call: call outgoing!'),
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      console.log('===here we go outside the component-------->');
      onEndButtonPress().then(() =>
        console.log('user dismissed call: call outgoing!'),
      );
      clearInterval(timer); // Cleanup function to clear the timeout if the component unmounts before the timeout
    };
  }, []);

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
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: '#eee',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesignIcons size={40} name={'mic'} color={'grey'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: 'grey',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesignIcons size={40} name="volume-high" color={'lightgrey'} />
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
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '700',
              color: 'white',
            }}>
            {'Calling ' + recipient_uid + ' ...'}
          </Text>

          <Animated.View style={[{position: 'absolute', top: 0}]}>
            <SmallWindow animation={animation} />
          </Animated.View>
        </View>
      </View>
    </AnimatedTouchableWithoutFeedback>
  );
};

export default CallOutGoing;

CallOutGoing.sharedElements = (navigation, otherNavigation, showing) => {
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

const SmallWindow = ({animation}) => {
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
            //source={require('../../assets/test_avatar.png')}
            source={require('./call-assets/test_avatar.png')}
            style={{
              width: SMALL_WINDOW_WIDTH * 0.5,
              height: SMALL_WINDOW_WIDTH * 0.5,
              borderWidth: 1,
              borderColor: '#000',
              borderRadius: 100,
            }}
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
