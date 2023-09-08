import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {presetBase} from './utils/color';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {webClientId} from './utils/utils';

const logoUri = 'https://freepngimg.com/thumb/chat/1-2-chat-png-image.png';

const LoginScreen = ({}: any) => {
  useEffect(() => {
    GoogleSignin.configure({webClientId: webClientId});
  }, []);

  async function onGoogleButtonPress() {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true}); // Check if your device supports Google Play
    const {idToken} = await GoogleSignin.signIn(); // Get the users ID token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken); // Create a Google credential with the token
    return auth().signInWithCredential(googleCredential); // Sign-in the user with the credential
  }

  const signIn = () => {
    onGoogleButtonPress()
      .then(async (result: any) => {
        if (result) {
          console.log(result, '-result-');
          console.log('ready to navigate');
        }
      })
      .catch((e: any) => {
        console.log('--error--', e);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ChatApp</Text>
      <Image source={{uri: logoUri}} style={styles.logo} />
      <Text style={styles.subtitle}>Sign in to get started</Text>
      <TouchableOpacity onPress={signIn} style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: presetBase.colors.darkBlack,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: presetBase.colors.white,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
    borderRadius: 100,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: presetBase.colors.white,
  },
  signInButton: {
    backgroundColor: presetBase.colors.redOnLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: presetBase.colors.white,
  },
});

export default LoginScreen;
