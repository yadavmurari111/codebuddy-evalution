import {useEffect, useState, useCallback, useRef, SetStateAction} from 'react';
import Sound from 'react-native-sound';
import useInterval from '@use-it/interval';
import {HookOptions, ReturnedValue, PlayFunction, PlayOptions} from './types';
import {validURL} from '../../utils/utils';

const useSound = (
  url: string,
  {
    volume = 1,
    soundEnabled = true,
    interrupt = false,
    timeRate = 1000,
    numberOfLoops = 0,
  }: HookOptions = {},
) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setIsError] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(0);

  const durationRef = useRef();
  const isPLayingRef = useRef();
  // @ts-ignore
  durationRef.current = duration;
  // @ts-ignore
  isPLayingRef.current = isPlaying;

  const handleSetSound = (_sound: Sound) => {
    setSound(_sound);
    setDuration(_sound.getDuration());
    setCurrentTime(0);
    setLoading(false);
  };

  useInterval(() => {
    if (sound?.isPlaying()) {
      sound?.getCurrentTime((sec: SetStateAction<number>) => {
        if (sec > duration) {
          setCurrentTime(duration);
        } else {
          setCurrentTime(sec);
        }
      });
    }
  }, timeRate);

  useEffect(() => {
    return () => {
      // console.log('leaving sound: ', isPLayingRef.current)
      if (isPLayingRef.current) {
        console.log('must shut down: ');
        stop();
      }
      // isCancelled = true;
    };
  }, [sound]);

  const play: PlayFunction = useCallback(
    async (options?: PlayOptions) => {
      // if (!sound || (!soundEnabled && !options?.forceSoundEnabled)) {
      //   return;
      // }
      if (interrupt) {
        sound.stop();
      }
      setIsFinished(false);

      if (sound) {
        // resume
        setIsPlaying(true);
        sound.play(error => {
          // finished playing
          setIsFinished(true);
          setIsPlaying(false);
          //@ts-ignore
          setCurrentTime(durationRef.current);
        });
      } else {
        // initiate
        setLoading(true);
        Sound.setCategory('Playback');
        let isCancelled = false;
        let basePath = '';
        if (!validURL(url)) {
          basePath = Sound.MAIN_BUNDLE;
        }
        const _sound = new Sound(url, basePath, error => {
          if (error) {
            // console.log(error)
            setIsError(true);
            return;
          }
          if (!isCancelled) {
            handleSetSound(_sound);
          } else {
            setLoading(false);
          }
          // _sound.setVolume(1)
          _sound.play(() => {
            setIsFinished(true);
            // finished playing
            setIsPlaying(false);
            //@ts-ignore
            setCurrentTime(durationRef.current);
          });
          setIsPlaying(true);
        });
      }
    },
    [sound, soundEnabled, interrupt],
  );

  const stop = useCallback(() => {
    console.log('stop called: ', sound); // why is sound undefined??
    if (!sound) {
      return;
    }
    sound.stop(() => setIsPlaying(false));
  }, [sound]);

  const pause = useCallback(() => {
    if (!sound) {
      return;
    }
    sound.pause(() => {
      setIsPlaying(false);
    });
  }, [sound]);

  const seek = useCallback(
    (sec: SetStateAction<number>) => {
      if (!sound) {
        return;
      }
      sound.setCurrentTime(sec);
      setCurrentTime(sec);
    },
    [sound],
  );

  const returnedValue: ReturnedValue = [
    play,
    pause,
    stop,
    {
      seek,
      sound,
      isPlaying,
      isFinished,
      duration,
      currentTime,
      loading,
      error,
    },
  ];
  return returnedValue;
};

export default useSound;
