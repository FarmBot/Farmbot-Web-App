import { mapStateToProps } from "../crop_catalog";
import { fakeState } from "../../../__test_support__/fake_state";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.cropSearchInProgress).toEqual(false);
  });
});
