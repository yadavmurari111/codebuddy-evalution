import React, {createContext, useContext, useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

export const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  const handleUser = rawUser => {
    if (rawUser) {
      const user = formatUser(rawUser);
      console.log('--user--', user);
      setUser(user);
      setLoading(false);
      return user;
    } else {
      setUser(false);
      setLoading(false);
      return false;
    }
  };

  async function onGoogleButtonPress() {
    GoogleSignin.configure({
      webClientId:
        '743424372114-lvfi9nvcli0jp2hj95hq1emm33b73ppj.apps.googleusercontent.com',
    });

    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    console.log('idToken', idToken);

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  useEffect(() => {
    const unsubscribe = auth().onUserChanged(handleUser);
    return () => unsubscribe();
  }, []);

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const user = auth().currentUser;
      if (user) {
        console.log('refreshing firebase token!');
        await user.getIdToken(true);
      }
    }, 10 * 60 * 1000);

    // clean up setInterval
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isLoadingInfo,
        setIsLoadingInfo,

        logout: async () => {
          try {
            await auth().signOut();
            setIsLoadingInfo(true);
          } catch (e) {
            console.error(e);
          }
        },

        googleLogin: async () => {
          try {
            setLoading(true);
            onGoogleButtonPress()
              .then(response => handleUser(response.user))
              .catch(error => {
                console.log('error is: ', error);
                setLoading(false);
                throw {code: error.code};
              });
          } catch (e) {
            console.error(e);
            setLoading(false);
          }
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};

const formatUser = user => {
  // const token = await user.getIdToken();
  return {
    uid: user.uid,
    email: user.email,
    selfUid: user.email === 'fitmurari@gmail.com' ? 'murari' : 'akram',
    friendUid: user.email !== 'fitmurari@gmail.com' ? 'murari' : 'akram',
    // name: user.displayName,
    // provider: user.providerData[0].providerId,
    // photoUrl: user.photoURL,
    // token
  };
};
