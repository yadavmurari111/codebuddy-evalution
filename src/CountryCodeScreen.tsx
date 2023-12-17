import React, {useEffect, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';

const CountryCodeScreen = ({navigation, route}: any) => {
  const {data} = route.params || {};
  const focused = useIsFocused();
  const [phonenumber, setPhonenumber] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [termsAndConditionsAccepted, setTermsAndConditionsAccepted] =
    useState(false);

  const handleValidation = async () => {
    if (phonenumber.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid phonenumber');
    } else if (!termsAndConditionsAccepted) {
      Alert.alert('Please Accept terms and conditions');
    } else {
      await saveData();
      setShowModal(true);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        'screen',
        JSON.stringify({selectedCountryCode, phonenumber}),
      );
      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedata = await AsyncStorage.getItem('screen'); // Retrieve data from AsyncStorage for screen2

      if (savedata !== null) {
        // Data found, update the state
        console.log('-data found in AsyncStorage-');
        const formattedData = JSON.parse(savedata);
        setSelectedCountryCode(formattedData.selectedCountryCode);
        setPhonenumber(formattedData.phonenumber);
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
    <View style={styles.mainContainer}>
      {!showModal ? (
        <>
          <Text style={{marginTop: '40%', ...styles.title}}>
            Country code<Text style={{color: 'red'}}> *</Text>
          </Text>
          <Picker
            style={{borderWidth: 1, width: 190}}
            selectedValue={selectedCountryCode}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedCountryCode(itemValue)
            }>
            <Picker.Item label=" India (+91)" value="+91" />
            <Picker.Item label="America (+1)" value="+1" />
          </Picker>
          <Text style={{marginTop: 20, ...styles.title}}>
            Phone number<Text style={{color: 'red'}}> *</Text>
          </Text>
          <View style={styles.texInputBox}>
            <TextInput
              placeholder="phone-number"
              placeholderTextColor={'grey'}
              keyboardType={'number-pad'}
              maxLength={10}
              value={phonenumber}
              onChangeText={setPhonenumber}
              style={{
                ...styles.textInput,
                borderBottomWidth: phonenumber.length > 0 ? 2 : 1,
                borderBottomColor: phonenumber.length > 0 ? 'purple' : 'grey',
              }}
            />
          </View>
          <View
            style={{marginTop: 40, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>Accept terms and conditions</Text>
            <CheckBox
              value={termsAndConditionsAccepted}
              onValueChange={setTermsAndConditionsAccepted}
            />
          </View>

          <View style={styles.buttonBox}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleValidation}
              style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>Save</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{flex: 1}}>
          <Modal
            isVisible={true}
            onBackdropPress={() => setShowModal(false)}
            animationIn={'bounce'}
            backdropOpacity={0.5}
            style={{flex: 1, alignItems: 'center'}}>
            <View
              style={{
                // height: 400,
                padding: 12,
                paddingVertical: 20,
                width: '80%',
                borderRadius: 10,
                backgroundColor: 'white',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: 'purple',
                }}>
                Your details are
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 14,
                }}>
                Email : {data.email}
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 14,
                }}>
                Password : {data.password}
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 14,
                }}>
                Firstname : {data.firstname}
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 14,
                }}>
                Lastname : {data.lastname}
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 14,
                }}>
                Address : {data.address}
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 14,
                }}>
                Country code : {selectedCountryCode}
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 14,
                }}>
                Phonenumber : {phonenumber}
              </Text>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
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

export default CountryCodeScreen;

//<View style={{flex: 1, backgroundColor: 'red'}}>
//       <Modal
//         isVisible={true}
//         animationIn={'bounce'}
//         backdropOpacity={0.5}
//         style={{flex: 1, backgroundColor: 'blue'}}>
//         <View
//           style={{
//             height: 400,
//             width: '100%',
//             borderRadius: 12,
//             backgroundColor: 'white',
//           }}>
//           <Text>I am the modal content!</Text>
//         </View>
//       </Modal>
//     </View>

//    <View style={styles.container}>
//       {!showModal ? (
//         <>
//           <Text style={{marginTop: '40%', ...styles.title}}>
//             Country code<Text style={{color: 'red'}}> *</Text>
//           </Text>
//           <Picker
//             style={{borderWidth: 1, width: 120}}
//             selectedValue={selectedCountryCode}
//             onValueChange={(itemValue, itemIndex) =>
//               setSelectedCountryCode(itemValue)
//             }>
//             <Picker.Item label="+91" value="+91" />
//             <Picker.Item label="+1" value="+1" />
//           </Picker>
//           <Text style={{marginTop: 20, ...styles.title}}>
//             Phone number<Text style={{color: 'red'}}> *</Text>
//           </Text>
//           <View style={styles.texInputBox}>
//             <TextInput
//               placeholder="Enter your lastname"
//               keyboardType={'number-pad'}
//               maxLength={10}
//               onChangeText={setPhonenumber}
//               style={{
//                 ...styles.textInput,
//                 borderBottomWidth: phonenumber.length > 0 ? 2 : 1,
//                 borderBottomColor: phonenumber.length > 0 ? 'purple' : 'grey',
//               }}
//             />
//           </View>
//           <View
//             style={{marginTop: 40, flexDirection: 'row', alignItems: 'center'}}>
//             <Text style={{fontSize: 16}}>Accept terms and conditions</Text>
//             <CheckBox
//               value={termsAndConditionsAccepted}
//               onValueChange={setTermsAndConditionsAccepted}
//             />
//           </View>
//
//           <View style={styles.buttonBox}>
//             <TouchableOpacity
//               onPress={() => navigation.goBack()}
//               style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
//               <Text style={{fontWeight: 'bold', fontSize: 16}}>Back</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
//               <Text style={{fontWeight: 'bold', fontSize: 16}}>Save</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={handleValidation}
//               style={{padding: 10, borderRadius: 5, backgroundColor: 'white'}}>
//               <Text style={{fontWeight: 'bold', fontSize: 16}}>
//                 Save and next
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </>
//       ) : (
//         // <View style={{}}>
//         <Modal
//           style={{
//             width: '90%',
//             height: '60%',
//             borderWidth: 3,
//             backgroundColor: 'red',
//           }}
//           animationType="slide"
//           //transparent={}
//           visible={showModal}
//           onRequestClose={() => {
//             setShowModal(false);
//           }}>
//           <View>
//             {/* Display the submitted details in the modal */}
//             <Text>Submitted Details:</Text>
//             {/*<Text>Email ID: {email}</Text>*/}
//             {/*<Text>First Name: {firstName}</Text>*/}
//             {/*<Text>Last Name: {lastName}</Text>*/}
//             {/*<Text>Address: {address}</Text>*/}
//             <Text>Country Code: {selectedCountryCode}</Text>
//             <Text>Phone Number: {phonenumber}</Text>
//
//             <Button title="Close" onPress={() => setShowModal(false)} />
//           </View>
//         </Modal>
//         // </View>
//       )}
//     </View>
