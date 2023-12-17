import React, {useEffect, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {ROUTE_NAME} from './navigation/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';

const LoginScreen = ({navigation}: any) => {
  const focused = useIsFocused();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);

  const validateEmail = (emailID: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailID);
  };

  const validatePassword = (Password: string) => {
    const passwordRegex =
      /^(?=(?:[^A-Z]*[A-Z]){2})(?=(?:[^a-z]*[a-z]){2})(?=(?:\D*\d){2})(?=(?:[^\W_]*[\W_]){2})[A-Za-z\d\W_]{8,}$/;
    return passwordRegex.test(Password);
  };

  const handleValidation = async () => {
    if (!validateEmail(email)) {
      setInvalidEmail(true);
      Alert.alert('Invalid Email', 'Please enter a valid email address');
    } else if (!validatePassword(password)) {
      setInvalidPassword(true);
      Alert.alert(
        'Invalid Password',
        'Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 numbers, and 2 special characters.',
      );
    } else {
      // Both email and password are valid, you can proceed with further actions
      await saveData();
      navigation.navigate(ROUTE_NAME.FIRSTNAME_SCREEN, {
        data: {email, password},
      });
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('screen1', JSON.stringify({email, password}));
      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedata = await AsyncStorage.getItem('screen1'); // Retrieve data from AsyncStorage for screen2

      if (savedata !== null) {
        // Data found, update the state
        console.log('-data found in AsyncStorage-');
        const formattedData = JSON.parse(savedata);
        setEmail(formattedData.email);
        setPassword(formattedData.password);
      } else {
        console.log('No data found in AsyncStorage.');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  useEffect(() => {
    if (focused) {
      loadData().then(() => console.log('data loading...'));
    }
  }, [focused]);

  return (
    <View style={styles.container}>
      <Text style={{marginTop: '40%', ...styles.title}}>
        Email<Text style={{color: 'red'}}> *</Text>
      </Text>
      <View style={styles.texInputBox}>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={'grey'}
          onChangeText={text => {
            setEmail(text);
            setInvalidEmail(!validateEmail(text));
          }}
          style={{
            ...styles.textInput,
            borderBottomWidth: email.length > 0 ? 2 : 1,
            borderBottomColor: email.length > 0 ? 'purple' : 'grey',
          }}
        />
      </View>
      {invalidEmail && (
        <Text style={styles.warningText}>
          {'Please enter a valid email address'}
        </Text>
      )}

      <Text style={{marginTop: 40, ...styles.title}}>
        Password<Text style={{color: 'red'}}> *</Text>
      </Text>
      <View style={styles.texInputBox}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={'grey'}
          secureTextEntry
          value={password}
          onChangeText={text => {
            setPassword(text);
            setInvalidPassword(!validatePassword(text));
          }}
          style={{
            borderBottomWidth: password.length > 0 ? 2 : 1,
            borderBottomColor: password.length > 0 ? 'purple' : 'grey',
            width: '60%',
            fontSize: 18,
          }}
        />
      </View>
      {invalidPassword && (
        <Text style={styles.warningText}>
          {
            'Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 numbers, and 2 special characters.'
          }
        </Text>
      )}

      <View style={styles.buttonBox}>
        <TouchableOpacity
          onPress={saveData}
          style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
          <Text style={{fontWeight: 'bold', fontSize: 16}}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleValidation}
          style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
          <Text style={{fontWeight: 'bold', fontSize: 16}}>Save and next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'lightblue',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  texInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    width: '80%',
    fontSize: 18,
  },
  warningText: {marginTop: 5, color: 'red'},
  buttonBox: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default LoginScreen;
