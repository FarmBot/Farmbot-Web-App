jest.unmock("../../auth/actions");
const actions = require("../../auth/actions");
const didLogin = jest.fn();
jest.mock("../../session", () => ({
  Session: {
    getNum: () => undefined,
    getBool: () => undefined,
    getAll: () => undefined
  }
}));
actions.didLogin = didLogin;
import { ready } from "../actions";

const STUB_STATE = { auth: "FOO BAR BAZ" };
describe("Actions", () => {
  it("fetches configs and calls didLogin()", () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => STUB_STATE);
    const thunk = ready();
    thunk(dispatch, getState);
    expect(didLogin.mock.calls.length).toBe(1);
  });
});
