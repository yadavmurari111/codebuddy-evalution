import { useEffect, useState, useCallback, useRef } from "react";
import Sound from "react-native-sound";
// import useInterval from "@use-it/interval";
import { HookOptions, ReturnedValue, PlayFunction, PlayOptions } from "./types";
import AudioRecorderPlayer from 'react-native-audio-recorder-player'

let audioRecorderPlayer = undefined
let currentPath = undefined
let currentCallback = () => { }
let currentPosition = 0

const useSoundIos = (
  url: string,
  date: string,
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
  const isLoadingRef = useRef();
  // @ts-ignore
  durationRef.current = duration;
  // @ts-ignore
  isPLayingRef.current = isPlaying;
  // @ts-ignore
  isLoadingRef.current = loading;

  useEffect(() => {
    // setLoading(true);
    // Sound.setCategory("Playback");
    // let isCancelled = false;
    // let basePath = "";
    // if (!validURL(url)) {
    //   basePath = Sound.MAIN_BUNDLE;
    // }
    // const _sound = new Sound(url, basePath, () => {
    //   if (!isCancelled) {
    //     handleSetSound(_sound);
    //   } else {
    //     setLoading(false);
    //   }
    // });

    return () => {
      // console.log('leaving sound')
      if (isPLayingRef.current) {
        console.log('must shut down: ')
        stop()
      }
      // isCancelled = true;
    };
  }, []);

  const play: PlayFunction = useCallback(
    async (options?: PlayOptions) => {
      console.log('playing: ', currentPath)
      if (currentPath === undefined) {
        currentPath = url
        // currentCallback = callback
      } else if (currentPath !== url) {
        console.log('current path changed')
        if (audioRecorderPlayer !== undefined) {
          try {
            console.log('we stopping?')
            await stop()
          } catch (error) {
            console.log('ERROR STOP PLAYER TOP')
          }
        }
        currentPath = url
        // currentCallback = callback
      }

      if (audioRecorderPlayer === undefined) {
        console.log('INITIATING PLAYER: ', url)
        audioRecorderPlayer = new AudioRecorderPlayer()
      } else {
        console.log('player already exists')
      }
      
      setIsFinished(false)

      try {
        if (currentPath === url && currentPosition > 0) {
          // resume
          setIsPlaying(true)
          console.log('resume')
          await audioRecorderPlayer.resumePlayer()
        } else {
          // begin
          console.log('begin')
          setLoading(true)
          await audioRecorderPlayer.startPlayer(currentPath);
          audioRecorderPlayer.addPlayBackListener(async (e) => {
            currentPosition = e.currentPosition
            if (isLoadingRef.current) {
              console.log('done loading: ', e.duration)
              setLoading(false)
              setIsPlaying(true)
              setDuration(e.duration)
            }
            if (e.currentPosition === e.duration) {
              try {
                console.log('sound finished')
                setIsFinished(true)
                await stop()
              } catch (error) {
                console.log('ERROR STOP PLAYER IN LISTENER')
              }
            }
            return
          });
        }
        } catch (error) {
          console.log({ 'ERROR PLAY PLAYER': error })
        }
    },
    []
  );

  const stop = useCallback(async () => {
    const isStop = await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener()
    currentPosition = 0
    currentPath = undefined
    // currentCallback({ status: AUDIO_STATUS.stop })
    setIsPlaying(false)
    // audioRecorderPlayer = undefined
  }, []);

  const pause = useCallback(async () => {
    setIsPlaying(false)
    try {
      await audioRecorderPlayer.pausePlayer();
    } catch (error) {
      console.log({ 'ERROR PAUSE PLAYER': error })
    }
  }, []);

  const seek = useCallback(
    (sec) => {
      if (!sound) {
        return;
      }
      sound.setCurrentTime(sec);
      setCurrentTime(sec);
    },
    [sound]
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

export default useSoundIos;