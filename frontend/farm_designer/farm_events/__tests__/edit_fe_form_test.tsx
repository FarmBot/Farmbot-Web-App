jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
  overwrite: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import {
  fakeFarmEvent, fakeSequence, fakeRegimen, fakePlant
} from "../../../__test_support__/fake_state/resources";
import { mount, shallow } from "enzyme";
import {
  EditFEForm,
  EditFEProps,
  FarmEventViewModel,
  recombine,
  destructureFarmEvent,
  offsetTime
} from "../edit_fe_form";
import { isString, isFunction } from "lodash";
import { repeatOptions } from "../map_state_to_props_add_edit";
import { SpecialStatus, ParameterApplication } from "farmbot";
import { success, error, warning } from "farmbot-toastr";
import moment from "moment";
import { fakeState } from "../../../__test_support__/fake_state";
import { history } from "../../../history";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import { clickButton } from "../../../__test_support__/helpers";
import { destroy } from "../../../api/crud";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

const mockSequence = fakeSequence();

describe("<FarmEventForm/>", () => {
  const props = (): EditFEProps => ({
    deviceTimezone: undefined,
    executableOptions: [],
    repeatOptions: [],
    farmEvent: fakeFarmEvent("Sequence", 12),
    dispatch: jest.fn(() => Promise.resolve()),
    findExecutable: jest.fn(() => mockSequence),
    title: "title",
    timeSettings: fakeTimeSettings(),
    autoSyncEnabled: false,
    shouldDisplay: () => false,
    resources: buildResourceIndex([]).index,
  });

  function instance(p: EditFEProps) {
    return mount(<EditFEForm {...p} />).instance() as EditFEForm;
  }
  const context = { form: new EditFEForm(props()) };

  beforeEach(() => {
    context.form = new EditFEForm(props());
  });

  it("sets defaults", () => {
    expect(context.form.state.fe).toMatchObject({});
  });

  it("determines if it is a one time event", () => {
    const i = instance(props());
    expect(i.repeats).toBe(false);
    i.mergeState("timeUnit", "daily");
    i.forceUpdate();
    expect(i.repeats).toBe(true);
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
    expect(i.executableGet().value).toEqual(mockSequence.body.id);
    expect(i.executableGet().label).toEqual(mockSequence.body.name);
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

  it("doesn't allow improper changes to the executable", () => {
    const p = props();
    p.farmEvent.body.executable_type = "Regimen";
    const i = instance(p);
    i.executableSet({ value: "wow", label: "hey", headingId: "Sequence" });
    expect(error).toHaveBeenCalledWith(
      "Cannot change from a Regimen to a Sequence.");
    expect(history.push).toHaveBeenCalledWith("/app/designer/events");
  });

  it("gets executable info", () => {
    const p = props();
    const i = instance(p);
    i.forceUpdate();
    const exe = i.executableGet();
    expect(exe.label).toBe("fake");
    expect(exe.value).toBe(mockSequence.body.id);
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
      id: 1,
      startDate: "2017-08-01",
      startTime: "08:35",
      endDate: "2017-08-01",
      endTime: "08:33",
      repeat: "1",
      timeUnit: "daily",
      executable_type: "Regimen",
      executable_id: "1",
      timeSettings: fakeTimeSettings(),
      body: undefined,
    }, { forceRegimensToMidnight: false });
    expect(result.time_unit).toEqual("never");
    expect(result.time_unit).not.toEqual("daily");
  });

  it("sets regimen start_time to `00:00` as needed", () => {
    const result = recombine({
      id: 1,
      startDate: "2017-08-01",
      startTime: "08:35",
      endDate: "2017-08-01",
      endTime: "08:33",
      repeat: "1",
      timeUnit: "daily",
      executable_type: "Regimen",
      executable_id: "1",
      timeSettings: fakeTimeSettings(),
      body: undefined,
    }, { forceRegimensToMidnight: true });
    expect(result.start_time).toEqual("2017-08-01T00:00:00.000Z");
  });

  it(`Recombines local state back into a TaggedFarmEvent["body"]`, () => {
    const result = recombine({
      id: 1,
      startDate: "2017-08-01",
      startTime: "08:35",
      endDate: "2017-08-01",
      endTime: "08:33",
      repeat: "1",
      timeUnit: "never",
      executable_type: "Regimen",
      executable_id: "1",
      timeSettings: fakeTimeSettings(),
    }, { forceRegimensToMidnight: false });
    expect(result).toEqual({
      id: 1,
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
          label: "Sequence: Every Node",
          value: 11,
          headingId: "Sequence"
        }
      ]}
      findExecutable={jest.fn(() => seq)}
      dispatch={jest.fn()}
      repeatOptions={repeatOptions}
      timeSettings={fakeTimeSettings()}
      autoSyncEnabled={false}
      resources={buildResourceIndex([]).index}
      shouldDisplay={() => false} />);
    el.update();
    const txt = el.text().replace(/\s+/g, " ");
    expect(txt).toContain("Save *");
  });

  it("displays success message on save: manual sync", async () => {
    const p = props();
    p.autoSyncEnabled = false;
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel(moment("2016-05-22T05:00:00.000Z"));
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("must first SYNC YOUR DEVICE"));
  });

  it("displays success message on save: auto sync", async () => {
    const p = props();
    p.autoSyncEnabled = true;
    p.farmEvent.body.executable_type = "Regimen";
    const regimen = fakeRegimen();
    regimen.body.regimen_items = [{ sequence_id: -1, time_offset: 100000000 }];
    p.findExecutable = () => regimen;
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel(moment("2016-05-22T05:00:00.000Z"));
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("The next item in this event will run"));
    expect(success).not.toHaveBeenCalledWith(
      expect.stringContaining("must first SYNC YOUR DEVICE"));
  });

  it("warns about missed regimen items", async () => {
    const p = props();
    const state = fakeState();
    state.resources.index.references = { [p.farmEvent.uuid]: p.farmEvent };
    p.dispatch = jest.fn(x => { isFunction(x) && x(); return Promise.resolve(); });
    p.farmEvent.body.executable_type = "Regimen";
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    window.alert = jest.fn();
    await i.commitViewModel(moment(offsetTime(
      "2017-05-22", "06:00", fakeTimeSettings())));
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("skipped regimen tasks"));
  });

  it("sends toast with regimen start time", async () => {
    const p = props();
    p.farmEvent.body.executable_type = "Regimen";
    const regimen = fakeRegimen();
    regimen.body.regimen_items = [{ sequence_id: -1, time_offset: 1000000000 }];
    p.findExecutable = () => regimen;
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel(moment(offsetTime(
      "2017-05-25", "06:00", fakeTimeSettings())));
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("run in 8 days"));
  });

  it("sends toast with next sequence run time", async () => {
    const p = props();
    p.farmEvent.body.executable_type = "Sequence";
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-06-22T06:00:00.000Z";
    p.farmEvent.body.repeat = 7;
    p.farmEvent.body.time_unit = "daily";
    const i = instance(p);
    await i.commitViewModel(moment(offsetTime(
      "2017-05-25", "06:00", fakeTimeSettings())));
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("will run in 4 days"));
  });

  const expectStartTimeToBeRejected = () => {
    expect(error).toHaveBeenCalledWith(
      "Event start time needs to be in the future, not the past.",
      "Unable to save event.");
  };

  it("displays error message on save (add): start time has passed", () => {
    const p = props();
    p.title = "add";
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    i.commitViewModel(moment("2017-06-22T05:00:00.000Z"));
    expectStartTimeToBeRejected();
  });

  it("doesn't display error message on edit: start time has passed", () => {
    const p = props();
    p.title = "edit";
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    i.commitViewModel(moment("2017-06-22T05:00:00.000Z"));
    expect(error).not.toHaveBeenCalled();
  });

  it("displays error message on save: no items", async () => {
    const p = props();
    p.shouldDisplay = () => true;
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel(moment("2017-06-22T05:00:00.000Z"));
    expect(warning).toHaveBeenCalledWith(expect.stringContaining(
      "Nothing to run."), "Warning");
  });

  it("allows start time: edit with unsupported OS", () => {
    const p = props();
    p.shouldDisplay = () => false;
    p.farmEvent.body.executable_type = "Regimen";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    p.title = "edit";
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("allows start time: add with supported OS", () => {
    const p = props();
    p.title = "add";
    p.shouldDisplay = () => true;
    p.farmEvent.body.executable_type = "Regimen";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("rejects start time: add sequence event", () => {
    const p = props();
    p.title = "add";
    p.farmEvent.body.executable_type = "Sequence";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeTruthy();
  });

  it("allows start time: edit sequence event", () => {
    const p = props();
    p.farmEvent.body.executable_type = "Sequence";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    p.title = "edit";
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("allows start time in the future", () => {
    const p = props();
    p.title = "add";
    p.farmEvent.body.executable_type = "Sequence";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T00:00:00.000Z");
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("edits a variable", () => {
    const p = props();
    const oldVariable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "foo",
        data_value: {
          kind: "point", args: {
            pointer_id: 1, pointer_type: "Plant"
          }
        }
      }
    };
    const newVariable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "foo",
        data_value: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } }
      }
    };
    const inst = instance(p);
    inst.setState({ fe: { body: [oldVariable] } });
    expect(inst.state.fe.body).toEqual([oldVariable]);
    expect(inst.state.specialStatusLocal).toEqual(SpecialStatus.SAVED);
    inst.editBodyVariables([oldVariable])(newVariable);
    expect(inst.state.fe.body).toEqual([newVariable]);
    expect(inst.state.specialStatusLocal).toEqual(SpecialStatus.DIRTY);
  });

  it("saves an updated variable", () => {
    const p = props();
    const oldVariable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "foo",
        data_value: {
          kind: "point", args: {
            pointer_id: 1, pointer_type: "Plant"
          }
        }
      }
    };
    p.farmEvent.body.body = [oldVariable];
    const newVariable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "foo",
        data_value: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } }
      }
    };
    const inst = instance(p);
    inst.setState({ fe: { body: [newVariable] } });
    expect(inst.updatedFarmEvent.body).toEqual([newVariable]);
  });

  it("saves the current variable", () => {
    const p = props();
    const sequence = fakeSequence();
    p.findExecutable = () => sequence;
    const plant = fakePlant();
    plant.body.id = 1;
    p.resources = buildResourceIndex([plant]).index;
    p.resources.sequenceMetas[sequence.uuid] = fakeVariableNameSet("foo");
    const oldVariable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "foo",
        data_value: {
          kind: "point", args: {
            pointer_id: 1, pointer_type: "Plant"
          }
        }
      }
    };
    p.farmEvent.body.body = [oldVariable];
    const inst = instance(p);
    expect(inst.updatedFarmEvent.body).toEqual([oldVariable]);
  });

  it("deletes a farmEvent", async () => {
    const p = props();
    p.dispatch = jest.fn(() => Promise.resolve());
    const inst = instance(p);
    const wrapper = shallow(<inst.FarmEventDeleteButton />);
    clickButton(wrapper, 0, "delete");
    await expect(destroy).toHaveBeenCalledWith(p.farmEvent.uuid);
    expect(history.push).toHaveBeenCalledWith("/app/designer/events");
    expect(success).toHaveBeenCalledWith("Deleted event.", "Deleted");
  });

  it("sets repeat", () => {
    const p = props();
    p.dispatch = jest.fn(() => Promise.resolve());
    const e = {
      currentTarget: { checked: true }
    } as React.ChangeEvent<HTMLInputElement>;
    const inst = instance(p);
    inst.toggleRepeat(e);
    expect(inst.state).toEqual({
      fe: { timeUnit: "daily" },
      specialStatusLocal: SpecialStatus.DIRTY
    });
  });

  it("sets repeat: regimen", () => {
    const p = props();
    p.farmEvent.body.executable_type = "Regimen";
    p.dispatch = jest.fn(() => Promise.resolve());
    const e = {
      currentTarget: { checked: true }
    } as React.ChangeEvent<HTMLInputElement>;
    const inst = instance(p);
    inst.toggleRepeat(e);
    expect(inst.state).toEqual({
      fe: { timeUnit: "never" },
      specialStatusLocal: SpecialStatus.DIRTY
    });
  });
});

describe("destructureFarmEvent", () => {
  it("Converts UTC to Bot's local time", () => {
    const fe = fakeFarmEvent("Sequence", 12);
    fe.body.start_time = "2017-12-28T21:32:00.000Z";
    fe.body.end_time = "2018-12-28T22:32:00.000Z";
    const timeSettings = fakeTimeSettings();
    timeSettings.utcOffset = 1;
    const { startTime, endTime } = destructureFarmEvent(fe, timeSettings);
    expect(startTime).toBe("22:32");
    expect(endTime).toBe("23:32");
  });
});
