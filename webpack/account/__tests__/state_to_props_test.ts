import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {
  it("populates data", () => {
    const result = mapStateToProps(fakeState());
    expect(result.user).toBeTruthy();
    expect(result.user).toBeInstanceOf(Object);
    expect(() => result.dispatch()).toThrow();
  });
});
