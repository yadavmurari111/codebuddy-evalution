import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/AuthProvider';
import Routes from './src/Routes';

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
