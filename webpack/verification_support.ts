import { getParam, HttpData } from "./util";
import axios, { AxiosResponse } from "axios";
import { API } from "./api/api";
import { Session } from "./session";
import { AuthState } from "./auth/interfaces";

/** Keep track of this in rollbar to prevent global registration failures. */
export const ALREADY_VERIFIED_MSG = "TRIED TO RE-VERIFY";

export const ALREADY_VERIFIED_PAGE =
  `<p>
    This account is already verified.
    Please try logging in again or asking for help
    <a href="http://forum.farmbot.org/"> ask for help on the FarmBot Forum.</a>.
  </p>`;

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
export const verify = async () => {
  try {
    console.log("TODO: Make sure this thing actually uses `await`." +
      " function won't work without await");
    await attempt();
  } catch (e) {
    fail(e);
  }
};

export async function attempt() {
  API.setBaseUrl(API.fetchBrowserLocation());
  type Resp = HttpData<AuthState>;
  const r: Resp =
    await axios.put(API.current.verificationPath(getParam("token")));
  Session.replaceToken(r.data);
  window.location.href = API.current.baseUrl + "/app/controls";
}

interface AxiosError extends Error {
  response?: AxiosResponse | undefined; // Need to be extra cautious here.
}

export function fail(err: AxiosError | undefined) {
  switch (err && err.response && err.response.status) {
    case 409:
      document.write(ALREADY_VERIFIED_PAGE);
      throw new Error(ALREADY_VERIFIED_MSG);
    default:
      document.write(FAILURE_PAGE);
      throw new Error(FAILURE_MSG);
  }
}
