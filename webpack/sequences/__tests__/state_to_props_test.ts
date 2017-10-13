jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = fakeState();
    const returnedProps = mapStateToProps(props);
    expect(returnedProps.sequence).toEqual(undefined);
    expect(returnedProps.syncStatus).toEqual("unknown");
  });
});
