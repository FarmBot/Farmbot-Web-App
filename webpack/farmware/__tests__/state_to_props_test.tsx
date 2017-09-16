import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {

  it("sync status unknown", () => {
    const props = mapStateToProps(fakeState());
    expect(props.syncStatus).toEqual("unknown");
  });

  it("currentImage undefined", () => {
    const props = mapStateToProps(fakeState());
    expect(props.currentImage).toBeFalsy();
  });

});
