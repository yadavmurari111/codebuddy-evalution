import React, {useEffect} from 'react';
import {presetBase} from './utils/color';
import {webClientId} from './utils/utils';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

  const anonymousLogin = async () => {
    try {
      const userCredential = await auth().signInAnonymously();
      const user = userCredential.user;

      if (user) {
        console.log('Anonymous user logged in:', user.uid);
      } else {
        console.log('Anonymous login failed');
      }
    } catch (error) {
      console.error('Error during anonymous login:', error);
    }
  };

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

  async function onAppleButtonPress() {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }

    // Create a Firebase credential from the response
    const {identityToken, nonce} = appleAuthRequestResponse;
    const appleCredential = await auth.AppleAuthProvider.credential(
      identityToken,
      nonce,
    );

    // Sign the user in with the credential
    return auth().signInWithCredential(appleCredential);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ChatApp</Text>
      <Image source={{uri: logoUri}} style={styles.logo} />
      <Text style={styles.subtitle}>Sign in to get started</Text>
      <TouchableOpacity onPress={signIn} style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={anonymousLogin}
        style={styles.anonymousSignInButton}>
        <Text style={styles.signInButtonText}>Anonymous Login</Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <TouchableOpacity onPress={onAppleButtonPress}>
          <View style={styles.appleBox}>
            <AntDesignIcons
              name="apple1"
              color={presetBase.colors.white}
              size={20}
            />
            <Text style={styles.signInButtonText}>Sign in with Apple</Text>
          </View>
        </TouchableOpacity>
      )}
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
    borderRadius: 4,
  },
  anonymousSignInButton: {
    marginTop: 10,
    backgroundColor: presetBase.colors.grey80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 4,
  },
  appleBox: {
    marginTop: 10,
    backgroundColor: presetBase.colors.grey80,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 4,
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
