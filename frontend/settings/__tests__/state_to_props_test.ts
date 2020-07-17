jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(x => { x(); return jest.fn(() => true); }),
  setWebAppConfigValue: jest.fn(),
}));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { BooleanSetting } from "../../session_keys";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    const value = props.getConfigValue(BooleanSetting.show_plants);
    expect(value).toEqual(true);
  });
});
