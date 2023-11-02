import React, {createRef} from 'react';
import {enableScreens} from 'react-native-screens';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/AuthProvider';
import Routes from './src/Routes';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';
import ROUTE_NAME from './src/navigation/navigation-constants';
import ChatScreen from './src/ChatScreen';
import IncomingCall from './src/screens/IncomingCall';
import {CardStyleInterpolators, TransitionSpecs} from '@react-navigation/stack';
import CallDetails from './src/screens/CallDetails';
// enableScreens(true);
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
