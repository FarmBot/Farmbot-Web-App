import { ALLOWED_MESSAGE_TYPES } from "farmbot";
import { MessageType } from "../sequences/interfaces";

const selectBeepCharacteristics =
  (type: ALLOWED_MESSAGE_TYPES): {
    wave: "sine" | "square",
    freq: number,
    vol: number,
    duration: number,
  } => {
    switch (type) {
      case MessageType.success:
      case MessageType.busy:
      case MessageType.info:
      case MessageType.fun:
      case MessageType.debug:
      case MessageType.assertion:
      default:
        return { wave: "sine", freq: 440, vol: 1, duration: 0.2 };
      case MessageType.warn:
      case MessageType.error:
        return { wave: "square", freq: 220, vol: 1, duration: 0.1 };
    }
  };

export const beep = (type: ALLOWED_MESSAGE_TYPES) => {
  const context = new AudioContext();
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.connect(gain);
  const values = selectBeepCharacteristics(type);
  osc.frequency.value = values.freq;
  osc.type = values.wave;
  gain.connect(context.destination);
  gain.gain.value = values.vol;
  osc.start(context.currentTime);
  osc.stop(context.currentTime + values.duration);
  return values;
};
