import {useRef} from 'react';
import Sound from 'react-native-sound';

const useSoundFromAssets = filepath => {
  const soundInstance = useRef(null);

  const playSound = () => {
    if (soundInstance.current !== null) {
      return;
    }
    console.log('--play sound--');

    setTimeout(() => {
      // Create a new Sound instance and play it
      soundInstance.current = new Sound(filepath, '', error => {
        console.log('error while playing sound: ', error);
      });

      setTimeout(() => {
        console.log('sound starts playing');
        soundInstance.current.play();
      }, 1);
    }, 1);
  };

  const stopSound = () => {
    console.log('stop sound!');
    // soundInstance.current.pause();
    if (soundInstance.current !== null) {
      soundInstance.current.stop();
    }
  };
  return {playSound, stopSound};
};
export default useSoundFromAssets;
