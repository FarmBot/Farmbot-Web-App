import { configReducer } from "../reducer";
import { ConfigState, ChangeApiPort, ChangeApiHost } from "../interfaces";
import { Actions } from "../../constants";
import { ReduxAction } from "../../redux/interfaces";

describe("configReducer", () => {
  const state1: ConfigState = {
    host: "lycos.com",
    port: "443"
  };

  it("handles an API port change", () => {
    const action1: ReduxAction<ChangeApiPort> = {
      type: Actions.CHANGE_API_PORT,
      payload: { port: "444" }
    };
    const r = configReducer(state1, action1);
    expect(r.port).toEqual("444");
  });

  it("Changes API host", () => {
    const action1: ReduxAction<ChangeApiHost> = {
      type: Actions.CHANGE_API_HOST,
      payload: { host: "altavista.com" }
    };
    const r = configReducer(state1, action1);
    expect(r.host).toEqual("altavista.com");
  });
});
