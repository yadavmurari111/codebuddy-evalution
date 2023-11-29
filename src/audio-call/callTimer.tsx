import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {formatTime} from '../utils/utils';

const ElapsedTimeInSeconds = ({startTimestamp}: any) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
      const elapsed = currentTimestamp - Math.floor(startTimestamp / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTimestamp]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{color: 'white', fontSize: 16, fontWeight: '700'}}>
        {formatTime(elapsedTime)}
      </Text>
    </View>
  );
};

export default ElapsedTimeInSeconds;
