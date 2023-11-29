import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../LoginScreen';
import ChatScreen from '../ChatScreen';
import ROUTE_NAME from './navigation-constants';
import ChatExportToPDF from '../ChatToPdfScreen';
import SendVideoComponent from '../components/send-video/send-video.component';
import FullscreenVideoPlayer from '../components/video-player/fullscreen-video-player.component';
import VideoCallScreen from '../VideoCallScreen';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';
import {CardStyleInterpolators, TransitionSpecs} from '@react-navigation/stack';
import IncomingCall from '../audio-call/IncomingCall';
import CallDetails from '../audio-call/CallDetails';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ROUTE_NAME.WELCOME_SCREEN_STACK}
        component={WelcomeScreenStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTE_NAME.LOGGEDIN_SCREEN_STACK}
        component={LoggedInScreenStack}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export const WelcomeScreenStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ROUTE_NAME.LOGIN_SCREEN}
        component={LoginScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export const LoggedInScreenStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShadowVisible: true}}>
      <Stack.Screen name={ROUTE_NAME.CHAT_SCREEN} component={ChatScreen} />
      <Stack.Screen
        name={ROUTE_NAME.SETTINGS_SCREEN}
        component={ChatExportToPDF}
      />
      <Stack.Screen
        name={ROUTE_NAME.VIDEO_TRIM_SCREEN}
        component={SendVideoComponent}
      />
      <Stack.Screen
        name={ROUTE_NAME.VIDEO_FULL_SCREEN}
        component={FullscreenVideoPlayer}
        options={{headerShown: true, title: ''}}
      />
      <Stack.Screen
        name={ROUTE_NAME.VIDEO_CALL_SCREEN}
        component={VideoCallScreen}
        options={{headerShown: true, title: ''}}
      />
    </Stack.Navigator>
  );
};
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
        name="IncomingCall"
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
        name="CallDetail"
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
      {/*<SharedScreen*/}
      {/*  name="DiaryDetail"*/}
      {/*  options={{...cardInterpolator, cardStyle: {backgroundColor: '#000'}}}*/}
      {/*  component={DiaryDetail}*/}
      {/*/>*/}
    </SharedNavigator>
  );
};
