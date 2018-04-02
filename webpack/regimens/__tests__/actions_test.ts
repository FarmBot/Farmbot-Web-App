import { editRegimen, saveRegimen, deleteRegimen, selectRegimen } from "../actions";
import { fakeRegimen } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
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

describe("saveRegimen()", () => {
  it("calls save", () => {
    const dispatch = jest.fn();
    const state = fakeState();
    state.resources.index = buildResourceIndex([fakeRegimen()]).index;
    const getState = () => state;
    saveRegimen(state.resources.index.all[0])(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      payload: state.resources.index.references[state.resources.index.all[0]],
      type: Actions.SAVE_RESOURCE_START
    });
  });
});

describe("deleteRegimen()", () => {
  it("doesn't delete regimen", () => {
    const dispatch = jest.fn();
    const state = fakeState();
    state.resources.index = buildResourceIndex([fakeRegimen()]).index;
    const getState = () => state;
    deleteRegimen(state.resources.index.all[0])(dispatch, getState);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("calls destroy", () => {
    const dispatch = jest.fn();
    const state = fakeState();
    state.resources.index = buildResourceIndex([fakeRegimen()]).index;
    const getState = () => state;
    // tslint:disable-next-line:no-any
    (global as any).confirm = () => true;
    deleteRegimen(state.resources.index.all[0])(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      payload: state.resources.index.references[state.resources.index.all[0]],
      type: Actions.DESTROY_RESOURCE_OK
    });
  });
});

describe("selectRegimen()", () => {
  it("selects regimen", () => {
    const regimen = fakeRegimen();
    regimen.uuid = "Regimen";
    const action = selectRegimen(regimen);
    expect(action).toEqual({
      payload: {
        body: { color: "red", name: "Foo", regimen_items: [] },
        kind: "Regimen",
        uuid: "Regimen",
        specialStatus: ""
      },
      type: Actions.SELECT_REGIMEN
    });
  });

  it("crashes if malformed", () => {
    const regimen = fakeRegimen();
    regimen.uuid = "nope";
    regimen.kind = "wrong" as any;
    expect(() => selectRegimen(regimen)).toThrowError();
  });
});
