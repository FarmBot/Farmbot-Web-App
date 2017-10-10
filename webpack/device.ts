import { Farmbot } from "farmbot";
import { bail } from "./util";
import { set } from "lodash";

let device: Farmbot;

export const getDevice = (): Farmbot => (device || bail("NO DEVICE SET"));

export function setDevice(bot: Farmbot): Farmbot {
  set(window, "current_bot", bot);
  return device = bot;
}
