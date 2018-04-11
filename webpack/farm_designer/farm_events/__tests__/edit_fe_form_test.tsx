const mockHistory = jest.fn();
jest.mock("../../../history", () => ({
  history: {
    push: mockHistory
  }
}));

jest.mock("farmbot-toastr", () => ({ success: jest.fn(), error: jest.fn() }));

import * as React from "react";
import { fakeFarmEvent, fakeSequence } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import {
  EditFEForm,
  EditFEProps,
  FarmEventViewModel,
  recombine,
  destructureFarmEvent
} from "../edit_fe_form";
import { isString } from "lodash";
import { repeatOptions } from "../map_state_to_props_add_edit";
import { SpecialStatus } from "../../../resources/tagged_resources";
import { success, error } from "farmbot-toastr";

describe("<FarmEventForm/>", () => {
  const props = (): EditFEProps => ({
    deviceTimezone: undefined,
    executableOptions: [],
    repeatOptions: [],
    farmEvent: fakeFarmEvent("Sequence", 12),
    dispatch: jest.fn(() => Promise.resolve()),
    findExecutable: jest.fn(() => fakeSequence()),
    title: "title",
    timeOffset: 0,
    autoSyncEnabled: false,
  });

  function instance(p: EditFEProps) {
    return mount(<EditFEForm {...p} />).instance() as EditFEForm;
  }
  const context = { form: new EditFEForm(props()) };

  beforeEach(() => {
    context.form = new EditFEForm(props());
    jest.clearAllMocks();
  });

  it("sets defaults", () => {
    expect(context.form.state.fe).toMatchObject({});
  });

  it("determines if it is a one time event", () => {
    const i = instance(props());
    expect(i.isOneTime).toBe(true);
    i.mergeState("timeUnit", "daily");
    i.forceUpdate();
    expect(i.isOneTime).toBe(false);
  });

  it("has a dispatch", () => {
    const p = props();
    const i = instance(p);
    expect(i.dispatch).toBe(p.dispatch);
    i.dispatch();
    expect(p.dispatch).toHaveBeenCalledTimes(1);
  });

  it("has a view model", () => {
    const p = props();
    const i = instance(p);
    i.forceUpdate();
    const vm = i.viewModel;
    const KEYS: (keyof FarmEventViewModel)[] = [
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

  it("has an executable", () => {
    const p = props();
    const i = instance(p);
    i.forceUpdate();
    expect(i.executableGet().value).toEqual(fakeSequence().body.id);
    expect(i.executableGet().label).toEqual(fakeSequence().body.name);
  });

  it("sets the executable", () => {
    const p = props();
    const i = instance(p);
    i.forceUpdate();
    i.executableSet({ value: "wow", label: "hey", headingId: "Sequence" });
    i.forceUpdate();
    expect(i.state.fe.executable_type).toEqual("Sequence");
    expect(i.state.fe.executable_id).toEqual("wow");
  });

  it("gets executable info", () => {
    const p = props();
    const i = instance(p);
    i.forceUpdate();
    const exe = i.executableGet();
    expect(exe.label).toBe("fake");
    expect(exe.value).toBe(12);
    expect(exe.headingId).toBe("Sequence");
  });

  it("sets a subfield of state.fe", () => {
    const p = props();
    const i = instance(p);
    i.forceUpdate();
    // tslint:disable-next-line:no-any
    i.fieldSet("repeat")(({ currentTarget: { value: "4" } } as any));
    i.forceUpdate();
    expect(i.state.fe.repeat).toEqual("4");
  });

  it("sets regimen repeat to `never` as needed", () => {
    const result = recombine({
      "startDate": "2017-08-01",
      "startTime": "08:35",
      "endDate": "2017-08-01",
      "endTime": "08:33",
      "repeat": "1",
      "timeUnit": "daily",
      "executable_type": "Regimen",
      "executable_id": "1",
      timeOffset: 0
    });
    expect(result.time_unit).toEqual("never");
    expect(result.time_unit).not.toEqual("daily");
  });

  it(`Recombines local state back into a Partial<TaggedFarmEvent["body"]>`, () => {
    const result = recombine({
      "startDate": "2017-08-01",
      "startTime": "08:35",
      "endDate": "2017-08-01",
      "endTime": "08:33",
      "repeat": "1",
      "timeUnit": "never",
      "executable_type": "Regimen",
      "executable_id": "1",
      timeOffset: 0
    });
    expect(result).toEqual({
      start_time: "2017-08-01T08:35:00.000Z",
      end_time: "2017-08-01T08:33:00.000Z",
      repeat: 1,
      time_unit: "never",
      executable_type: "Regimen",
      executable_id: 1
    });
  });

  it("renders the correct save button text when adding", () => {
    const seq = fakeSequence();
    const fe = fakeFarmEvent("Sequence", seq.body.id || 0);
    fe.specialStatus = SpecialStatus.DIRTY;
    const el = mount(<EditFEForm
      farmEvent={fe}
      title=""
      deviceTimezone="America/Chicago"
      executableOptions={[
        {
          "label": "Sequence: Every Node",
          "value": 11,
          "headingId": "Sequence"
        }
      ]}
      findExecutable={jest.fn(() => seq)}
      dispatch={jest.fn()}
      repeatOptions={repeatOptions}
      timeOffset={0}
      autoSyncEnabled={false} />);
    el.update();
    const txt = el.text().replace(/\s+/g, " ");
    expect(txt).toContain("Save *");
  });

  it("displays success message on save: manual sync", async () => {
    const p = props();
    p.autoSyncEnabled = false;
    p.farmEvent.body.start_time = "2020-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2020-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel();
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("must first SYNC YOUR DEVICE"));
  });

  it("displays success message on save: auto sync", async () => {
    const p = props();
    p.autoSyncEnabled = true;
    p.farmEvent.body.start_time = "2020-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2020-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel();
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("This Farm Event will run"));
    expect(success).not.toHaveBeenCalledWith(
      expect.stringContaining("must first SYNC YOUR DEVICE"));
  });

  it("displays error message on save", async () => {
    const p = props();
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "This Farm Event does not appear to have a valid run time"));
  });
});

describe("destructureFarmEvent", () => {
  it("Converts UTC to Bot's local time", () => {
    const fe = fakeFarmEvent("Sequence", 12);
    fe.body.start_time = "2017-12-28T21:32:00.000Z";
    fe.body.end_time = "2018-12-28T22:32:00.000Z";

    const { startTime, endTime } = destructureFarmEvent(fe, 1);
    expect(startTime).toBe("22:32");
    expect(endTime).toBe("23:32");
  });
});
