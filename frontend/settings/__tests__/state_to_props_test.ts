import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { BooleanSetting } from "../../session_keys";
import * as configStorageActions from "../../config_storage/actions";

describe("mapStateToProps()", () => {
  let getWebAppConfigValueSpy: jest.SpyInstance;

  beforeEach(() => {
    getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
      .mockImplementation(() => () => true);
  });

  afterEach(() => {
    getWebAppConfigValueSpy.mockRestore();
  });

  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    const value = props.getConfigValue(BooleanSetting.show_plants);
    expect(value).toEqual(true);
  });
});
