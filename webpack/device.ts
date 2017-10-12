import { Farmbot } from "farmbot";
import { bail } from "./util";
import { set } from "lodash";
import { AuthState } from "./auth/interfaces";
import { maybeRefreshToken } from "./refresh_token";

let device: Farmbot;

const secure = location.protocol === "https:"; // :(

export const getDevice = (): Farmbot => (device || bail("NO DEVICE SET"));

export function fetchNewDevice(oldToken: AuthState): Promise<Farmbot> {
  return maybeRefreshToken(oldToken)
    .then(({ token }) => {
      device = new Farmbot({ token: token.encoded, secure });
      set(window, "current_bot", device);
      return device
        .connect()
        .then(() => {
          return device;
        }, () => bail("NO CONNECT"));
    });
}
