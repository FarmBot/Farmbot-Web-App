import * as React from "react";
import { fakeFarmEvent, fakeSequence } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { EditFEForm, EditFEProps } from "../edit_fe_form";

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
  let context = { form: new EditFEForm(props()) };

  beforeEach(() => {
    context.form = new EditFEForm(props());
  });

  it("sets defaults", () => {
    expect(context.form.state.fe).toMatchObject({});
    expect(context.form.state.localCopyDirty).toBeFalsy();
  });

  it("determines if it is a one time event", () => {
    let el = mount<EditFEProps>(<EditFEForm {...props() } />);
    let i = el.instance() as EditFEForm;
    expect(i.isOneTime).toBe(true);
    i.mergeState("timeUnit", "daily");
    i.forceUpdate();
    expect(i.isOneTime).toBe(false);
  });

  it("has a dispatch");
  it("has a view model");
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
