import React, {useCallback, useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import * as ImagePicker from 'react-native-image-picker';
import {ImagePickerResponse} from 'react-native-image-picker/src/types';
import {Asset} from 'react-native-image-picker';
import {presetBase} from '../../utils/color';

const TrimVideoComponent = ({navigation, routes}: any) => {
  return <View style={{flex: 1, padding: 10, backgroundColor: 'white'}} />;
};

export default TrimVideoComponent;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end', // Adjust this as needed
    marginBottom: 2, // Adjust this as needed to create spacing between bubbles
  },
});
