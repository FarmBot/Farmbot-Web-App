jest.unmock("../../auth/actions");
const actions = require("../../auth/actions");
let didLogin = jest.fn();
jest.mock("../../session", () => ({ Session: { get: () => false } }));
actions.didLogin = didLogin;
import { ready } from "../actions";

const STUB_STATE = { auth: "FOO BAR BAZ" };
describe("Actions", () => {
  it("fetches configs and calls didLogin()", () => {
    let dispatch = jest.fn();
    let getState = jest.fn(() => STUB_STATE);
    let thunk = ready();
    thunk(dispatch, getState);
    expect(didLogin.mock.calls.length).toBe(1);
  });
});
