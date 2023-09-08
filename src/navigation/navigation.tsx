import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../LoginScreen';
import ChatScreen from '../ChatScreen';
import ROUTE_NAME from './navigation-constants';

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
    </Stack.Navigator>
  );
};
