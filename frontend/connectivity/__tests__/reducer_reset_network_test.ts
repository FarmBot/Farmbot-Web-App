import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { ReduxAction } from "../../redux/interfaces";
import { resetNetwork } from "../../devices/actions";

describe("Connectivity Reducer - RESET_NETWORK", () => {
  it("clears all network status", () => {
    const action: ReduxAction<{}> = resetNetwork();
    const result = connectivityReducer(DEFAULT_STATE, action);
    const values: (keyof typeof DEFAULT_STATE)[] = [
      "bot.mqtt",
      "user.mqtt",
      "user.api"
    ];
    values.map((x) => expect(result[x]).toBeUndefined());
  });
});
