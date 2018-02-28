// import { getParam, HttpData } from "./util";
// import axios, { AxiosResponse } from "axios";
// import { API } from "./api/api";
// import { Session } from "./session";
// import { AuthState } from "./auth/interfaces";

// /** Keep track of this in rollbar to prevent global registration failures. */
// export const ALREADY_VERIFIED =
//   `<p>
//    You are already verified. We will now forward you to the main application.
//  </p>
//  <p>
//    If you are still unable to access the app, try logging in again or
//    <a href="http://forum.farmbot.org/"> asking for help on the FarmBot Forum.</a>
//  </p>`;
// const ALREADY_VERIFIED_MSG = "TRIED TO RE-VERIFY";

// export const FAILURE_PAGE =
//   `<p>
//      This verification link is not valid. Most likely you either copy/pasted
//      the link incorrectly or are trying to use an old link. Please use the most
//      recent email verification link that was sent to you.
//    </p>
//    <p>
//      Please try again or <a href="http://forum.farmbot.org/"> ask for help on
//      the FarmBot Forum.</a>
//    </p>`;

// export const FAILURE_MSG = "USER VERIFICATION FAILED!";

// /** Function called when the Frontend verifies its registration token.
//  * IF YOU BREAK THIS FUNCTION, YOU BREAK *ALL* NEW USER REGISTRATIONS. */
// // export const verify = async () => {
// //   try {
// //     await attempt();
// //   } catch (e) {
// //     fail(e);
// //   }
// // };

// export async function attempt() {
//   API.setBaseUrl(API.fetchBrowserLocation());
//   type Resp = HttpData<AuthState>;
//   const r: Resp =
//     await axios.put(API.current.verificationPath(getParam("token")));
//   Session.replaceToken(r.data);
//   window.location.href = API.current.baseUrl + "/app/controls";
// }

// interface AxiosError extends Error {
//   response?: AxiosResponse | undefined; // Need to be extra cautious here.
// }

// export function fail(err: AxiosError | undefined) {
//   switch (err && err.response && err.response.status) {
//     case 409:
//       return alreadyVerified();
//     default:
//       document.write(FAILURE_PAGE);
//       throw new Error(FAILURE_MSG);
//   }
// }

// const alreadyVerified = (): never => {
//   // Wait 2 seconds to let the user know what's going on.
//   setTimeout(() => window.location.href = "/app/controls", 2000);
//   document.write(ALREADY_VERIFIED);
//   // Throw an error to keep track of stats (may be a sign of a system outage)
//   throw new Error(ALREADY_VERIFIED_MSG);
// };
