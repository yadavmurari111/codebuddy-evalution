import React, {FunctionComponent, useEffect} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {presetBase} from './utils/color';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {webClientId} from './utils/utils';

interface ISettingsScreen {
  navigation: any;
  route: any;
}

const SettingsScreen: FunctionComponent<
  ISettingsScreen
> = ({}: ISettingsScreen) => {
  // Initialize Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: webClientId,
    });
  }, []);

  const showSuccessAlert = () => {
    Alert.alert(
      'Anonymous user linked to Google account!',
      '',
      [{text: 'cancel'}, {text: 'OK'}],
      {cancelable: false}, // Prevents dismissing the alert by tapping outside of it
    );
  };

  const showErrorAlert = (error: string) => {
    Alert.alert(
      'Something went wrong!',
      error,
      [{text: 'cancel'}, {text: 'OK'}],
      {cancelable: false}, // Prevents dismissing the alert by tapping outside of it
    );
  };

  const connectGoogle = async () => {
    try {
      const anonymousUser = auth().currentUser; // Sign in anonymously
      if (!anonymousUser) {
        console.log('No anonymous user found.');
        return;
      }

      // Prompt the user to sign in with Google
      await GoogleSignin.hasPlayServices();
      const googleUser = await GoogleSignin.signIn();

      // Link the Google credential to the anonymous user
      const googleCredential = auth.GoogleAuthProvider.credential(
        googleUser.idToken,
        googleUser.accessToken,
      );
      await anonymousUser.linkWithCredential(googleCredential);

      console.log('Anonymous user linked to Google account.');
      showSuccessAlert();
    } catch (error) {
      console.error('Error during linking:', error);
      showErrorAlert(error);
    }
  };

  async function signOutAndClearSessions() {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth().signOut();

      // After clearing the sessions, the account selection modal appear when re-logging in.
    } catch (error) {
      console.error('Error signing out and clearing sessions:', error);
    }
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={connectGoogle} style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Connect with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={signOutAndClearSessions}
        style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    paddingBottom: 200,
  },
  signInButton: {
    marginTop: 10,
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
