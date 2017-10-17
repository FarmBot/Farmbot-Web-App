import { getParam, HttpData } from "./util";
import axios from "axios";
import { API } from "./api/api";
import { Session } from "./session";
import { AuthState } from "./auth/interfaces";

export const FAILURE_PAGE =
  `<p>
     We were unable to verify your account.
   </p>
   <p>
     Please try again or <a href="http://forum.farmbot.org/"> ask for help on
     the FarmBot Forum.</a>
   </p>`;

export const FAILURE_MSG = "USER VERIFICATION FAILED!";

/** Function called when the Frontend verifies its registration token.
 * IF YOU BREAK THIS FUNCTION, YOU BREAK *ALL* NEW USER REGISTRATIONS. */
export const verify = async () => { try { attempt(); } catch (e) { fail(); } };

export async function attempt() {
  API.setBaseUrl(API.fetchBrowserLocation());
  type Resp = HttpData<AuthState>;
  const r: Resp =
    await axios.put(API.current.verificationPath(getParam("token")));
  Session.replaceToken(r.data);
  window.location.href = API.current.baseUrl + "/app/controls";
}

export function fail() {
  document.write(FAILURE_PAGE);
  throw new Error(FAILURE_MSG);
}
