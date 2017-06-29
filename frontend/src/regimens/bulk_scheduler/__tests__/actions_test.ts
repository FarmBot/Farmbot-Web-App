let errorStub = jest.fn();
jest.mock("i18next", () => ({ t: (i: string) => i }))
jest.mock("farmbot-toastr", () => ({ error: errorStub }));

import { commitBulkEditor } from "../actions";
import { fakeState } from "../../../__test_support__/fake_state";

describe("commitBulkEditor()", () => {
  it("does nothing if no regimen is selected", () => {
    let getState = () => fakeState();
    let dispatch = jest.fn();
    let results = commitBulkEditor()(dispatch, getState);
    expect(dispatch.mock.calls.length).toEqual(0);
    expect(errorStub.mock.calls.length).toEqual(1);
  });
});
