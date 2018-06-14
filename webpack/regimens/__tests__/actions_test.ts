import { editRegimen, selectRegimen } from "../actions";
import { fakeRegimen } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { SpecialStatus } from "../../resources/tagged_resources";

describe("editRegimen()", () => {
  it("doesn't call edit", () => {
    const dispatch = jest.fn();
    editRegimen(undefined, {})(dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("calls edit", () => {
    const dispatch = jest.fn();
    const regimen = fakeRegimen();
    regimen.uuid = "Regimen";
    editRegimen(regimen, {})(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        update: {},
        uuid: "Regimen",
        specialStatus: SpecialStatus.DIRTY
      },
      type: Actions.EDIT_RESOURCE
    });
  });
});

describe("selectRegimen()", () => {
  it("selects regimen", () => {
    const action = selectRegimen("Regimen.0.0");
    expect(action).toEqual({
      payload: "Regimen.0.0",
      type: Actions.SELECT_REGIMEN
    });
  });

  it("crashes if malformed", () => {
    console.warn = jest.fn();
    expect(() => selectRegimen("wrong")).toThrowError();
  });
});
