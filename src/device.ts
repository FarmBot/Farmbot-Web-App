import { Farmbot } from "farmbot";

interface Devices {
  online: boolean;
  current: Farmbot;
}

function NullBot(): Farmbot {
  // Allow me to explain: I'm following the null object pattern to prevent nil
  // checks all over the app. That way, all of our "if undefined" logic is in
  // one place and NullBot satisfies the same interface as a real bot.
  const funnyConfigObject = {
    token: `0.${btoa("\"NOT_SET\"")}.0`,
    secure: false
  };
  let bot = new Farmbot(funnyConfigObject);
  bot.connect = () => Promise.reject(`Tried to connect to null bot.
    You probably meant to set a bot first.`);
  return bot;
}

export var devices: Devices = {
  online: false,
  current: NullBot()
};
