import { mapStateToProps } from "../state_to_props";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeUser } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {
  it("fetches the appropriate resources", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeUser()]);
    const result = mapStateToProps(state);
    expect(result.timeOffset).toEqual(0);
  });
});
