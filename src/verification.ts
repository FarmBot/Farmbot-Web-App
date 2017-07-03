import { getParam } from "./util";
import { put } from "axios";
import { API } from "./api/api";
import { Session } from "./session";
import { AuthState } from "./auth/interfaces";
// THIS ONE IS IMPORTANT, EVEN THOUGH IT DOESN'T LOOK LIKE IT.

/** Function called when the Frontend verifies its registration token.
 * IF YOU BREAK THIS FUNCTION, YOU BREAK *ALL* NEW USER REGISTRATIONS.
 */
export async function verify() {
  const token = getParam("token");
  const url = API.fetchBrowserLocation();
  try {
    let { data } = await put<AuthState>(url + "/api/users/verify/" + token);
    Session.put(data);
    window.location.href = window.location.origin + "/app/controls";
  } catch (e) {
    document.write(`
      <p>
      We were unable to verify your account.
      </p>
      <p>
      Please try again or <a href="http://forum.farmbot.org/"> ask for help on
      the FarmBot Forum.</a>
      </p>
      `);
    throw new Error("USER VERIFICATION FAILED!");
  }
}

verify();
