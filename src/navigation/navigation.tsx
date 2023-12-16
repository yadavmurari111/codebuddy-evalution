import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../LoginScreen';

export const ROUTE_NAME = {
  WELCOME_SCREEN_STACK: 'WelcomeStack',
  LOGIN_SCREEN: 'Login-Screen',
};

const Stack = createNativeStackNavigator();

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
