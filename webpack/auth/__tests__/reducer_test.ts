import { authReducer } from "../reducer";
import { setToken } from "../actions";
import { AuthState } from "../interfaces";

describe("Auth reducer", () => {
  function fakeToken(): AuthState {
    const output: Partial<AuthState> = {
      // tslint:disable-next-line:no-any
      token: ({} as any)
    };
    return output as AuthState;
  }

  it("replaces the token", () => {
    const result = authReducer(undefined, setToken(fakeToken()));
    expect(result).toBeTruthy();
    expect(result && result.token).toBeTruthy();
  });
});
