import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { ReduxAction } from "../../redux/interfaces";
import { resetNetwork } from "../../devices/actions";

describe("Connectivity Reducer - RESET_NETWORK", () => {
  it("clears all network status", () => {
    const action: ReduxAction<{}> = resetNetwork();
    const result = connectivityReducer(DEFAULT_STATE, action);
    const values: (keyof typeof DEFAULT_STATE)[] = [
      "user.mqtt",
      "user.api",
      "bot.mqtt"
    ];
    values
      .map((x) => {
        const status = result[x];
        const text = status ? status.state : "MISSING";
        expect(text).toBe("down");
      });
  });
});
