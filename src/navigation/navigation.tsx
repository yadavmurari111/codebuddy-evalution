import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../LoginScreen';
import ChatScreen from '../ChatScreen';
import ROUTE_NAME from './navigation-constants';
import ChatExportToPDF from '../ChatToPdfScreen';
import SendVideoComponent from '../components/send-video/send-video.component';
import FullscreenVideoPlayer from '../components/video-player/fullscreen-video-player.component';
import VideoCallScreen from '../VideoCallScreen';

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
