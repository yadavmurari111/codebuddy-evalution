import React, {FunctionComponent} from 'react';
import {StyleSheet, View} from 'react-native';

const DotAnimation: FunctionComponent = () => (
  <View style={styles.container}>
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
  </View>
);
export default DotAnimation;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 5,
    marginRight: 4,
    borderRadius: 100,
    backgroundColor: 'white',
  },
});
