import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {WelcomeScreenStack} from './src/navigation/navigation';

const App = () => {
  return (
    <NavigationContainer>
      <WelcomeScreenStack />
    </NavigationContainer>
  );
};

export default App;
