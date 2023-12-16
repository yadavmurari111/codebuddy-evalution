import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
//<Icon name={'closecircle'} size={24} color={'green'} />
const LoginScreen = ({}: any) => {
  const [correctEmail, setCorrectEmail] = useState('false');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (emailID: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailID);
  };

  const validatePassword = (Password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(Password);
  };

  const handleValidation = () => {
    if (!validateEmail(email)) {
      // Alert.alert('Invalid Email', 'Please enter a valid email address');
    } else if (!validatePassword(password)) {
      Alert.alert(
        'Invalid Password',
        'Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 numbers, and 2 special characters.',
      );
    } else {
      // Both email and password are valid, you can proceed with further actions
      // Alert.alert('Success', 'Form submitted successfully!');
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={styles.title}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          onChangeText={setEmail}
          style={{borderWidth: 1, width: '60%', borderRadius: 12}}
        />
        {email.length > 5 && (
          <View>
            <Icon name={'checkcircle'} size={24} color={'green'} />
          </View>
        )}
      </View>
      <View
        style={{
          marginTop: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={styles.title}>Email</Text>
        <TextInput
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={text => setPassword(text)}
        />
        {email.length > 5 && (
          <View style={{margin: 5}}>
            <Icon name={'checkcircle'} size={24} color={'green'} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
  },
  title: {
    width: '20%',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'black',
  },
});

export default LoginScreen;
