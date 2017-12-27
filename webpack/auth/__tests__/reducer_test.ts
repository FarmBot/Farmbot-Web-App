import { authReducer } from "../reducer";
import { setToken } from "../actions";
import { AuthState } from "../interfaces";

describe("Auth reducer", () => {
  function fakeToken(): AuthState {
    const output: Partial<AuthState> = {
      token: ({} as any)
    };
    return output as AuthState;
  }

  it("replaces the token", () => {
    const result = authReducer({ token: undefined }, setToken(fakeToken()));
    expect(result.token).toBeTruthy();
  });
});
