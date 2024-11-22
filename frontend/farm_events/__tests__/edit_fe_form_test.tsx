jest.mock("../../api/crud", () => ({
  save: jest.fn(),
  overwrite: jest.fn(),
}));

let mockTzMismatch = false;
jest.mock("../../devices/timezones/guess_timezone", () => ({
  timezoneMismatch: () => mockTzMismatch,
}));

import React from "react";
import {
  fakeFarmEvent, fakeSequence, fakeRegimen, fakePlant,
} from "../../__test_support__/fake_state/resources";
import { mount, shallow } from "enzyme";
import {
  EditFEForm,
  EditFEProps,
  FarmEventViewModel,
  recombine,
  destructureFarmEvent,
  offsetTime,
  RepeatForm,
  RepeatFormProps,
  StartTimeForm,
  StartTimeFormProps,
} from "../edit_fe_form";
import { isString, isFunction } from "lodash";
import { SpecialStatus, ParameterApplication } from "farmbot";
import moment from "moment";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { save } from "../../api/crud";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { error, success, warning } from "../../toast/toast";
import { BlurableInput } from "../../ui";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { Path } from "../../internal_urls";
import { Content } from "../../constants";

const mockSequence = fakeSequence();

describe("<EditFEForm />", () => {
  const fakeProps = (): EditFEProps => ({
    deviceTimezone: undefined,
    executableOptions: [],
    repeatOptions: [],
    farmEvent: fakeFarmEvent("Sequence", 12),
    dispatch: jest.fn(() => Promise.resolve()),
    findExecutable: jest.fn(() => mockSequence),
    title: "title",
    timeSettings: fakeTimeSettings(),
    resources: buildResourceIndex([]).index,
    setSpecialStatus: jest.fn(),
  });

  function instance(p: EditFEProps) {
    return mount(<EditFEForm {...p} />).instance() as EditFEForm;
  }
  const context = { form: new EditFEForm(fakeProps()) };

  beforeEach(() => {
    context.form = new EditFEForm(fakeProps());
  });

  it("sets defaults", () => {
    expect(context.form.state.fe).toMatchObject({});
  });

  it("has a view model", () => {
    const p = fakeProps();
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
    const p = fakeProps();
    const i = instance(p);
    i.forceUpdate();
    expect(i.executableGet().value).toEqual(mockSequence.body.id);
    expect(i.executableGet().label).toEqual(mockSequence.body.name);
  });

  it("errors upon bad executable", () => {
    const p = fakeProps();
    p.farmEvent.body.executable_type = "nope" as ExecutableType;
    console.error = jest.fn();
    expect(() => instance(p)).toThrow("nope is not a valid executable_type");
  });

  it("sets the executable", () => {
    const p = fakeProps();
    const i = instance(p);
    i.forceUpdate();
    i.executableSet({ value: "wow", label: "hey", headingId: "Sequence" });
    i.forceUpdate();
    expect(i.state.fe.executable_type).toEqual("Sequence");
    expect(i.state.fe.executable_id).toEqual("wow");
  });

  it("allows proper changes to the executable", () => {
    const p = fakeProps();
    p.farmEvent.body.id = 0;
    p.farmEvent.body.executable_type = "Sequence";
    const i = instance(p);
    i.navigate = jest.fn();
    i.executableSet({ value: "wow", label: "hey", headingId: "Regimen" });
    expect(error).not.toHaveBeenCalled();
    expect(i.navigate).not.toHaveBeenCalled();
  });

  it("doesn't allow improper changes to the executable", () => {
    const p = fakeProps();
    p.farmEvent.body.id = 1;
    p.farmEvent.body.executable_type = "Regimen";
    const i = instance(p);
    i.navigate = jest.fn();
    i.executableSet({ value: "wow", label: "hey", headingId: "Sequence" });
    expect(error).toHaveBeenCalledWith(
      "Cannot change between Sequences and Regimens.");
    expect(i.navigate).toHaveBeenCalledWith(Path.farmEvents());
  });

  it("handles empty dropdown value", () => {
    const p = fakeProps();
    p.farmEvent.body.id = 1;
    p.farmEvent.body.executable_type = "Regimen";
    const i = instance(p);
    i.navigate = jest.fn();
    i.executableSet({ value: "", label: "hey", headingId: "Sequence" });
    expect(error).not.toHaveBeenCalled();
    expect(i.navigate).not.toHaveBeenCalled();
  });

  it("gets executable info", () => {
    const p = fakeProps();
    const i = instance(p);
    i.forceUpdate();
    const exe = i.executableGet();
    expect(exe.label).toBe("fake");
    expect(exe.value).toBe(mockSequence.body.id);
    expect(exe.headingId).toBe("Sequence");
  });

  it("shows missing executable warning", () => {
    const p = fakeProps();
    p.executableOptions = [{ label: "", value: 0, heading: true }];
    const wrapper = mount(<EditFEForm {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
  });

  it("doesn't show missing executable warning", () => {
    const p = fakeProps();
    p.executableOptions = [{ label: "", value: 0, heading: false }];
    const wrapper = mount(<EditFEForm {...p} />);
    expect(wrapper.html()).not.toContain("fa-exclamation-triangle");
  });

  it("doesn't show tz warning", () => {
    mockTzMismatch = false;
    const p = fakeProps();
    const wrapper = mount(<EditFEForm {...p} />);
    expect(wrapper.html()).not.toContain(Content.FARM_EVENT_TZ_WARNING);
  });

  it("shows tz warning", () => {
    mockTzMismatch = true;
    const p = fakeProps();
    const wrapper = mount(<EditFEForm {...p} />);
    expect(wrapper.html()).toContain(Content.FARM_EVENT_TZ_WARNING);
  });

  it("sets a subfield of state.fe", () => {
    const p = fakeProps();
    const i = instance(p);
    i.forceUpdate();
    i.fieldSet("executable_id", "1");
    i.forceUpdate();
    expect(i.state.fe.executable_id).toEqual("1");
  });

  it("displays success message on save", async () => {
    const p = fakeProps();
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
  });

  it("warns about missed regimen items", async () => {
    const p = fakeProps();
    p.farmEvent.body.executable_type = "Regimen";
    const regimen = fakeRegimen();
    regimen.body.regimen_items = [
      { sequence_id: -1, time_offset: 0 },
      { sequence_id: -1, time_offset: 1000000000 },
    ];
    p.findExecutable = () => regimen;
    p.dispatch = jest.fn(x => { isFunction(x) && x(); return Promise.resolve(); });
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
    const p = fakeProps();
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
    const p = fakeProps();
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
      { title: "Unable to save event." });
  };

  it("displays error message on save (add): start time has passed", () => {
    const p = fakeProps();
    p.title = "add";
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    i.commitViewModel(moment("2017-06-22T05:00:00.000Z"));
    expectStartTimeToBeRejected();
  });

  it("displays error message on edit: start time has passed", () => {
    const p = fakeProps();
    p.title = "edit";
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    i.commitViewModel(moment("2017-06-22T05:00:00.000Z"));
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Nothing to run."), { title: "Unable to save event." });
  });

  it("displays error message on save: no items", async () => {
    const p = fakeProps();
    p.farmEvent.body.start_time = "2017-05-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-05-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel(moment("2017-06-22T05:00:00.000Z"));
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Nothing to run."), { title: "Unable to save event." });
  });

  it("displays error message on save: save error", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn()
      .mockResolvedValueOnce("")
      .mockRejectedValueOnce("error");
    p.farmEvent.body.start_time = "2017-07-22T05:00:00.000Z";
    p.farmEvent.body.end_time = "2017-07-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel(moment("2017-06-22T05:00:00.000Z"));
    await expect(save).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Unable to save event.");
  });

  it("displays warning", async () => {
    const p = fakeProps();
    const device = fakeDevice();
    device.body.ota_hour = 3;
    p.resources = buildResourceIndex([device]).index;
    p.farmEvent.body.start_time = "2017-05-22T03:00:00.000Z";
    p.farmEvent.body.end_time = "2017-06-22T06:00:00.000Z";
    const i = instance(p);
    await i.commitViewModel(moment("2017-05-21T03:00:00.000Z"));
    await expect(save).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(
      "The next item in this event will run in a day.");
    expect(warning).toHaveBeenCalledWith(Content.WITHIN_HOUR_OF_OS_UPDATE);
  });

  it("throws error for invalid executable_type", () => {
    const p = fakeProps();
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    const i = instance(p);
    p.farmEvent.body.executable_type = "nope" as ExecutableType;
    const action = () => i.nextItemTime(p.farmEvent.body, fakeNow);
    expect(action).toThrow("nope is not a valid executable_type");
  });

  it("handles incorrect kind", () => {
    const p = fakeProps();
    p.farmEvent.body.executable_type = "Regimen";
    const regimen = fakeRegimen();
    regimen.kind = "nope" as "Regimen";
    p.findExecutable = () => regimen;
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    const nextItem = instance(p).nextItemTime(p.farmEvent.body, fakeNow);
    expect(nextItem).toEqual(undefined);
  });

  it("allows start time: edit with unsupported OS", () => {
    const p = fakeProps();
    p.farmEvent.body.executable_type = "Regimen";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    p.title = "edit";
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("allows start time: add with supported OS", () => {
    const p = fakeProps();
    p.title = "add";
    p.farmEvent.body.executable_type = "Regimen";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("rejects start time: add sequence event", () => {
    const p = fakeProps();
    p.title = "add";
    p.farmEvent.body.executable_type = "Sequence";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeTruthy();
  });

  it("allows start time: edit sequence event", () => {
    const p = fakeProps();
    p.farmEvent.body.executable_type = "Sequence";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T02:00:00.000Z");
    p.title = "edit";
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("allows start time in the future", () => {
    const p = fakeProps();
    p.title = "add";
    p.farmEvent.body.executable_type = "Sequence";
    p.farmEvent.body.start_time = "2017-06-01T01:00:00.000Z";
    const fakeNow = moment("2017-06-01T00:00:00.000Z");
    const reject = instance(p).maybeRejectStartTime(p.farmEvent.body, fakeNow);
    expect(reject).toBeFalsy();
  });

  it("edits a variable", () => {
    const p = fakeProps();
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
    inst.editBodyVariables([oldVariable])(newVariable);
    expect(inst.state.fe.body).toEqual([newVariable]);
    expect(p.setSpecialStatus).toHaveBeenCalledWith(SpecialStatus.DIRTY);
  });

  it("saves an updated variable", () => {
    const p = fakeProps();
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
    const p = fakeProps();
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

  it("displays correct variable count", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    p.findExecutable = () => sequence;
    p.resources = buildResourceIndex([]).index;
    const variables = fakeVariableNameSet("foo");
    variables["none"] = undefined;
    variables["bar"] = {
      celeryNode: {
        kind: "parameter_declaration",
        args: {
          label: "foo",
          default_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
        }
      },
      dropdown: { label: "", value: "" },
      vector: { x: 0, y: 0, z: 0 },
    };
    p.resources.sequenceMetas[sequence.uuid] = variables;
    const wrapper = mount(<EditFEForm {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("variables (1)");
  });

  it("collapses variables section", () => {
    const wrapper = shallow<EditFEForm>(<EditFEForm {...fakeProps()} />);
    expect(wrapper.state().variablesCollapsed).toEqual(false);
    wrapper.instance().toggleVarShow();
    expect(wrapper.state().variablesCollapsed).toEqual(true);
  });
});

describe("recombine()", () => {
  it("sets regimen repeat to `never` as needed", () => {
    const result = recombine({
      id: 1,
      startDate: "2017-08-01",
      startTime: "08:35",
      endDate: "2017-08-01",
      endTime: "08:33",
      repeat: "0",
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

  it("Recombines local state back into a TaggedFarmEvent['body']", () => {
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
});

describe("offsetTime()", () => {
  it("handles matching timezones", () => {
    const timeSettings = fakeTimeSettings();
    timeSettings.utcOffset = 0;
    const result = offsetTime("2017-05-22", "06:00", timeSettings);
    expect(result).toEqual("2017-05-22T06:00:00.000Z");
  });

  it("handles timezone difference", () => {
    const timeSettings = fakeTimeSettings();
    timeSettings.utcOffset = 1;
    const result = offsetTime("2017-05-22", "06:00", timeSettings);
    expect(result).toEqual("2017-05-22T05:00:00.000Z");
  });
});

describe("destructureFarmEvent", () => {
  it("converts UTC to bot's local time", () => {
    const fe = fakeFarmEvent("Sequence", 12);
    fe.body.start_time = "2017-12-28T21:32:00.000Z";
    fe.body.end_time = "2018-12-28T22:32:00.000Z";
    const timeSettings = fakeTimeSettings();
    timeSettings.utcOffset = 1;
    const { startTime, endTime } = destructureFarmEvent(fe, timeSettings);
    expect(startTime).toBe("22:32");
    expect(endTime).toBe("23:32");
  });

  it("handles missing times", () => {
    const fe = fakeFarmEvent("Sequence", 1);
    fe.body.end_time = undefined;
    fe.body.repeat = 0;
    fe.body.executable_id = 0;
    const timeSettings = fakeTimeSettings();
    const result = destructureFarmEvent(fe, timeSettings);
    expect(result.endDate).toEqual(expect.stringContaining("-"));
    expect(result.endTime).toEqual(expect.stringContaining(":"));
    expect(result.repeat).toEqual("1");
    expect(result.executable_id).toEqual("");
  });
});

describe("<StartTimeForm />", () => {
  const mockVM = {
    startDate: "2017-07-25",
    startTime: "08:57",
  } as FarmEventViewModel;

  const fakeProps = (): StartTimeFormProps => ({
    isRegimen: false,
    fieldGet: jest.fn(key => "" + mockVM[key]),
    fieldSet: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("changes start date", () => {
    const p = fakeProps();
    const wrapper = shallow(<StartTimeForm {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "2017-07-26" }
    });
    expect(p.fieldSet).toHaveBeenCalledWith("startDate", "2017-07-26");
  });

  it("changes start time", () => {
    const p = fakeProps();
    const wrapper = shallow(<StartTimeForm {...p} />);
    wrapper.find("EventTimePicker").simulate("commit", {
      currentTarget: { value: "08:57" }
    });
    expect(p.fieldSet).toHaveBeenCalledWith("startTime", "08:57");
  });

  it("displays error", () => {
    const p = fakeProps();
    p.now = moment();
    const wrapper = shallow(<StartTimeForm {...p} />);
    expect(wrapper.find(BlurableInput).first().props().error?.toLowerCase())
      .toContain("must be in the future");
  });

  it("doesn't display error: old event", () => {
    mockVM.id = 1;
    const p = fakeProps();
    p.now = moment();
    const wrapper = shallow(<StartTimeForm {...p} />);
    expect(wrapper.find(BlurableInput).first().props().error).toEqual(undefined);
  });

  it("doesn't display error: regimen", () => {
    const p = fakeProps();
    p.now = moment();
    p.isRegimen = true;
    const wrapper = shallow(<StartTimeForm {...p} />);
    expect(wrapper.find(BlurableInput).first().props().error).toEqual(undefined);
  });

  it("doesn't display error: in future", () => {
    const p = fakeProps();
    p.now = moment("2015-12-28T22:32:00.000Z");
    const wrapper = shallow(<StartTimeForm {...p} />);
    expect(wrapper.find(BlurableInput).first().props().error).toEqual(undefined);
  });
});

describe("<RepeatForm />", () => {
  const fakeProps = (): RepeatFormProps => ({
    isRegimen: false,
    fieldGet: jest.fn(key =>
      "" + ({
        endDate: "2017-07-26", endTime: "08:57",
        startDate: "2017-07-25", startTime: "08:57"
      } as FarmEventViewModel)[key]),
    fieldSet: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("toggles repeat on", () => {
    const p = fakeProps();
    const wrapper = shallow(<RepeatForm {...p} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { checked: true }
    });
    expect(p.fieldSet).toHaveBeenCalledWith("timeUnit", "daily");
  });

  it("toggles repeat off", () => {
    const p = fakeProps();
    const wrapper = shallow(<RepeatForm {...p} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { checked: false }
    });
    expect(p.fieldSet).toHaveBeenCalledWith("timeUnit", "never");
  });
});
