jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { TaggedDevice } from "../../resources/tagged_resources";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = fakeState();
    const returnedProps = mapStateToProps(props);
    expect(returnedProps.sequence).toEqual(undefined);
    expect(returnedProps.syncStatus).toEqual("unknown");
  });

  const checkVersionResult =
    (bot: string | undefined,
      api: string | undefined,
      expected: string | undefined) => {
      const state = fakeState();
      state.bot.hardware.informational_settings.controller_version = bot;
      (state.resources.index
        .references[state.resources.index.byKind.Device[0]] as TaggedDevice)
        .body.fbos_version = api;
      const props = mapStateToProps(state);
      expect(props.installedOsVersion).toEqual(expected);
    };

  it("returns correct installed FBOS version string", () => {
    checkVersionResult(undefined, undefined, undefined);
    checkVersionResult("1.1.1", undefined, "1.1.1");
    checkVersionResult(undefined, "1.1.1", "1.1.1");
    checkVersionResult("bad", undefined, undefined);
    checkVersionResult(undefined, "bad", undefined);
    checkVersionResult("bad", "1.1.1", "1.1.1");
    checkVersionResult("1.2.3", "2.3.4", "2.3.4");
    checkVersionResult("1.0.1", "1.0.0", "1.0.1");
  });

});
