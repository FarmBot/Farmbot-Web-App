import * as React from "react";
import { fakeFarmEvent, fakeSequence } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { EditFEForm, EditFEProps, FarmEventViewModel } from "../edit_fe_form";
import { isString } from "lodash";

describe("<FarmEventForm/>", () => {
  let props = (): EditFEForm["props"] => ({
    deviceTimezone: undefined,
    executableOptions: [],
    repeatOptions: [],
    farmEvent: fakeFarmEvent("Sequence", 12),
    dispatch: jest.fn(),
    findExecutable: jest.fn(() => fakeSequence()),
    title: "title"
  });

  function instance(p: EditFEProps) {
    return mount<EditFEProps>(<EditFEForm {...p } />).instance() as EditFEForm;
  }
  let context = { form: new EditFEForm(props()) };

  beforeEach(() => {
    context.form = new EditFEForm(props());
  });

  it("sets defaults", () => {
    expect(context.form.state.fe).toMatchObject({});
    expect(context.form.state.localCopyDirty).toBeFalsy();
  });

  it("determines if it is a one time event", () => {
    let i = instance(props());
    expect(i.isOneTime).toBe(true);
    i.mergeState("timeUnit", "daily");
    i.forceUpdate();
    expect(i.isOneTime).toBe(false);
  });

  it("has a dispatch", () => {
    let p = props();
    let i = instance(p);
    expect(i.dispatch).toBe(p.dispatch);
  });

  it("has a view model", () => {
    let p = props();
    let i = instance(p);
    i.forceUpdate();
    let vm = i.viewModel;
    let KEYS: (keyof FarmEventViewModel)[] = [
      "startDate",
      "startTime",
      "endDate",
      "endTime",
      "repeat",
      "timeUnit",
      "executable_type",
      "executable_id",
    ];

    KEYS.map(key => expect(isString(vm[key])).toBe(true));
    expect(vm.repeat).toEqual("" + p.farmEvent.body.repeat);
  });
  it("has an executable");
  it("sets the executable");
  it("gets a property of an executable");
  it("sets a subfield of state.fe");
  it("gets a subfield of state.fe");
  it("merges state");
  it("toggles repeat");
  it("commits the view model");
  it("knows if it has a regimen");
});
