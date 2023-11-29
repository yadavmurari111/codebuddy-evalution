import React, {createRef} from 'react';
import {enableScreens} from 'react-native-screens';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/AuthProvider';
import Routes from './src/Routes';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';
import ROUTE_NAME from './src/navigation/navigation-constants';
import ChatScreen from './src/ChatScreen';
import {CardStyleInterpolators, TransitionSpecs} from '@react-navigation/stack';
import ChatExportToPDF from './src/ChatToPdfScreen';
import SendVideoComponent from './src/components/send-video/send-video.component';
import FullscreenVideoPlayer from './src/components/video-player/fullscreen-video-player.component';
import VideoCallScreen from './src/VideoCallScreen';
import IncomingCall from './src/audio-call/IncomingCall';
import CallDetails from './src/audio-call/CallDetails';
import CallOutGoing from './src/audio-call/CallOutgoing';
enableScreens(true);
export const animationRef = createRef({});
animationRef.current = {};

const {Navigator: SharedNavigator, Screen: SharedScreen} =
  createSharedElementStackNavigator();

const cardInterpolator = {
  cardStyleInterpolator: ({current: {progress}}) => {
    return {
      cardStyle: {
        opacity: progress,
      },
    };
  },
  transitionSpec: {
    open: {animation: 'timing', config: {duration: 300}},
    close: {animation: 'timing', config: {duration: 300}},
  },
};

export const SharedStack = () => {
  return (
    <SharedNavigator>
      <SharedScreen name={ROUTE_NAME.CHAT_SCREEN} component={ChatScreen} />

      <SharedScreen
        name={ROUTE_NAME.VIDEO_CALL_INCOMING}
        component={IncomingCall}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          cardStyle: {backgroundColor: 'transparent'},
          gestureEnabled: true,
          gestureDirection: 'vertical',
          gestureResponseDistance: {vertical: 1000},
          transitionSpec: {
            open: TransitionSpecs.TransitionIOSSpec,
            close: TransitionSpecs.TransitionIOSSpec,
            // open: { animation: 'spring', config: { duration: 500, bounciness: 0 } },
            // close: { animation: 'timing', config: { duration: 300 } }
          },
        }}
      />
      <SharedScreen
        name={ROUTE_NAME.VIDEO_CALL_DETAIL}
        options={{
          ...cardInterpolator,
          transitionSpec: {
            open: TransitionSpecs.TransitionIOSSpec,
            close: TransitionSpecs.TransitionIOSSpec,
          },
          headerShown: false,
        }}
        component={CallDetails}
      />
      <SharedScreen
        name={ROUTE_NAME.SETTINGS_SCREEN}
        component={ChatExportToPDF}
      />
      <SharedScreen
        name={ROUTE_NAME.VIDEO_TRIM_SCREEN}
        component={SendVideoComponent}
      />
      <SharedScreen
        name={ROUTE_NAME.VIDEO_FULL_SCREEN}
        component={FullscreenVideoPlayer}
        options={{headerShown: true, title: ''}}
      />
      <SharedScreen
        name={ROUTE_NAME.VIDEO_CALL_SCREEN}
        component={VideoCallScreen}
        options={{headerShown: true, title: ''}}
      />
      <SharedScreen
        name={ROUTE_NAME.VIDEO_CALL_OUTGOING}
        component={CallOutGoing}
        options={{headerShown: false, title: ''}}
      />
    </SharedNavigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
