export const webClientId =
  '740686211971-3dpncpat9qqb7kg939jfnmflg3tjbalm.apps.googleusercontent.com';

export function getRandomNumber(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Use string interpolation to format the result as "MM:SS"
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toFixed(0)
    .toString()
    .padStart(2, '0')}`;
}

export const validURL = (str: string) => {
  const regex =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return regex.test(str);
};

export const numberOfBars = (duration: number) => {
  switch (true) {
    case duration < 5:
      return duration + 3;

    case duration < 10:
      return duration;

    case duration < 20:
      return Math.floor(duration / 1.5);

    case duration < 40:
      return Math.floor(duration / 1.5);

    case duration < 50:
      return Math.floor(duration / 2);

    case duration > 60:
      return 22;

    default:
      return 22;
  }
};
