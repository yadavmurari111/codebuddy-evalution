import {useAuth} from './AuthProvider';
import React, {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {SafeAreaProvider} from 'react-native-safe-area-context/src/SafeAreaContext';
import {LoggedInScreenStack, WelcomeScreenStack} from './navigation/navigation';
import {ActivityIndicator} from 'react-native';
import {SharedStack} from '../App';

export default function Routes() {
  // const { user, loading } = useUser()

  const {user} = useAuth();
  const [loading, setLoading] = useState(true);

  function onAuthStateChanged(user) {
    if (loading) {
      setLoading(false);
    }
  }

  useEffect(() => {
    return auth().onAuthStateChanged(onAuthStateChanged); // unsubscribe on unmount
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaProvider style={{backgroundColor: 'black'}}>
      {user ? <SharedStack /> : <WelcomeScreenStack />}
    </SafeAreaProvider>
  );
}
