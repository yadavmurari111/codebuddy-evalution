import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../LoginScreen';
import FirstNameScreen from '../FirstNameScreen';
import CountryCodeScreen from '../CountryCodeScreen';

export const ROUTE_NAME = {
  WELCOME_SCREEN_STACK: 'WelcomeStack',
  LOGIN_SCREEN: 'Login-Screen',
  FIRSTNAME_SCREEN: 'FirstName-Screen',
  COUNTRYCODE_SCREEN: 'CountryCode-Screen',
};

const Stack = createNativeStackNavigator();

export const WelcomeScreenStack = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTE_NAME.LOGIN_SCREEN}>
      <Stack.Screen
        name={ROUTE_NAME.LOGIN_SCREEN}
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTE_NAME.FIRSTNAME_SCREEN}
        component={FirstNameScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTE_NAME.COUNTRYCODE_SCREEN}
        component={CountryCodeScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
