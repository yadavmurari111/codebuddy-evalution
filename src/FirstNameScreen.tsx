import React, {useEffect, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ROUTE_NAME} from './navigation/navigation';
import {useIsFocused} from '@react-navigation/native';

const FirstNameScreen = ({navigation, route}: any) => {
  const {data} = route.params || {};
  const focused = useIsFocused();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [address, setAddress] = useState('');
  const [invalidFirstname, setInvalidFirstname] = useState(false);
  const [invalidAddress, setInvalidAddress] = useState(false);

  const validateFirstname = (text: string) => {
    const onlyAlphabet = /^[A-Za-z]+$/;
    return text.length >= 2 && text.length < 50 && onlyAlphabet.test(text);
  };

  const validateAddress = (text: string) => {
    return text.length > 10;
  };

  const handleValidation = async () => {
    if (!validateFirstname(firstname)) {
      setInvalidFirstname(true);
      Alert.alert('Firstname', 'Minimum of 2 character and maximum 50.');
    } else if (!validateAddress(address)) {
      setInvalidAddress(true);
      Alert.alert('Invalid Address', 'Minimum character must be  10.');
    } else {
      // Both email and password are valid, you can proceed with further actions
      await saveData();
      navigation.navigate(ROUTE_NAME.COUNTRYCODE_SCREEN, {
        data: {...data, firstname, lastname, address},
      });
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        'screen2',
        JSON.stringify({firstname, lastname, address}),
      );
      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedata = await AsyncStorage.getItem('screen2'); // Retrieve data from AsyncStorage for screen2

      if (savedata !== null) {
        // Data found, update the state
        console.log('-data found in AsyncStorage-');
        const formattedData = JSON.parse(savedata);
        setFirstname(formattedData.firstname);
        setLastname(formattedData.lastname);
        setAddress(formattedData.address);
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
        First name<Text style={{color: 'red'}}> *</Text>
      </Text>
      <View style={styles.texInputBox}>
        <TextInput
          placeholder="Enter your firstname"
          placeholderTextColor={'grey'}
          maxLength={50}
          value={firstname}
          onChangeText={text => {
            setFirstname(text);
            setInvalidFirstname(!validateFirstname(text));
          }}
          style={{
            ...styles.textInput,
            borderBottomWidth: firstname.length > 0 ? 2 : 1,
            borderBottomColor: firstname.length > 0 ? 'purple' : 'grey',
          }}
        />
      </View>
      {invalidFirstname && (
        <Text style={styles.warningText}>
          {'Minimum of 2 character and maximum 50 : only alphabets'}
        </Text>
      )}
      <Text style={{marginTop: 20, ...styles.title}}>Last name</Text>
      <View style={styles.texInputBox}>
        <TextInput
          placeholder="Enter your lastname"
          placeholderTextColor={'grey'}
          keyboardType={'email-address'}
          value={lastname}
          onChangeText={setLastname}
          style={{
            ...styles.textInput,
            borderBottomWidth: lastname.length > 0 ? 2 : 1,
            borderBottomColor: lastname.length > 0 ? 'purple' : 'grey',
          }}
        />
      </View>

      <Text style={{marginTop: 20, ...styles.title}}>
        Address<Text style={{color: 'red'}}> *</Text>
      </Text>
      <View style={styles.texInputBox}>
        <TextInput
          placeholder="Enter your Address"
          placeholderTextColor={'grey'}
          keyboardType={'email-address'}
          value={address}
          onChangeText={text => {
            setAddress(text);
            setInvalidAddress(!validateAddress(text));
          }}
          style={{
            ...styles.textInput,
            borderBottomWidth: address.length > 0 ? 2 : 1,
            borderBottomColor: address.length > 0 ? 'purple' : 'grey',
          }}
        />
      </View>
      {invalidAddress && (
        <Text style={styles.warningText}>
          {'Minimum length of address is 10'}
        </Text>
      )}

      <View style={styles.buttonBox}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
          <Text style={{fontWeight: 'bold', fontSize: 16}}>Back</Text>
        </TouchableOpacity>
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

export default FirstNameScreen;
