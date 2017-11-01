import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { ReduxAction } from "../../redux/interfaces";
import { resetNetwork } from "../../devices/actions";
import { values } from "lodash";
describe("Connectivity Reducer - RESET_NETWORK", () => {
  it("clears all network status", () => {
    const action: ReduxAction<{}> = resetNetwork();
    const result = connectivityReducer(DEFAULT_STATE, action);
    values(result).map((x) => expect(x).toBeUndefined());
  });
});
