import React from "react";
import moment from "moment";
import { success, error, warning } from "../toast/toast";
import {
  TaggedFarmEvent, SpecialStatus, TaggedSequence, TaggedRegimen,
  ParameterApplication,
} from "farmbot";
import { ExecutableQuery } from "../farm_designer/interfaces";
import { formatTimeField, formatDateField } from "./map_state_to_props_add_edit";
import {
  BlurableInput,
  Row,
  FBSelect,
  DropDownItem,
  Help,
} from "../ui";
import { save, overwrite } from "../api/crud";
import { betterMerge, parseIntInput } from "../util";
import { maybeWarnAboutMissedTasks } from "./util";
import { FarmEventRepeatForm } from "./farm_event_repeat_form";
import { scheduleForFarmEvent } from "./calendar/scheduler";
import { executableType } from "../farm_designer/util";
import { Content } from "../constants";
import { EventTimePicker } from "./event_time_picker";
import { TzWarning } from "./tz_warning";
import { nextRegItemTimes } from "./map_state_to_props";
import { first, some } from "lodash";
import {
  TimeUnit, ExecutableType, FarmEvent,
} from "farmbot/dist/resources/api_resources";
import { LocalsList } from "../sequences/locals_list/locals_list";
import { ResourceIndex } from "../resources/interfaces";
import {
  addOrEditParamApps, variableList, getRegimenVariableData,
} from "../sequences/locals_list/variable_support";
import {
  AllowedVariableNodes,
} from "../sequences/locals_list/locals_list_support";
import { t } from "../i18next_wrapper";
import { TimeSettings } from "../interfaces";
import { ErrorBoundary } from "../error_boundary";
import { Path } from "../internal_urls";
import { Collapse } from "@blueprintjs/core";
import { SectionHeader } from "../sequences/sequence_editor_middle_active";
import { nearOsUpdateTime } from "../regimens/bulk_scheduler/bulk_scheduler";
import { timeToMs } from "../regimens/bulk_scheduler/utils";
import { getDeviceAccountSettings } from "../resources/selectors";
import { NavigationContext } from "../routes_helpers";

export const NEVER: TimeUnit = "never";
/** Separate each of the form fields into their own interface. Recombined later
 * on save.
 */
export interface FarmEventViewModel {
  id: number | undefined;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  repeat: string;
  timeUnit: string;
  executable_type: string;
  executable_id: string;
  timeSettings: TimeSettings;
  body?: ParameterApplication[];
}

type FarmEventViewModelKey = keyof FarmEventViewModel;

/** Breaks up a TaggedFarmEvent into a structure that can easily be used
 * by the edit form.
 * USE CASE EXAMPLE: We have a "date" and "time" field that are created from
 *                   a single "start_time" FarmEvent field. */
export function destructureFarmEvent(
  fe: TaggedFarmEvent, timeSettings: TimeSettings): FarmEventViewModel {
  const startTime = fe.body.start_time;
  const endTime = fe.body.end_time || new Date();
  return {
    id: fe.body.id,
    startDate: formatDateField(startTime.toString(), timeSettings),
    startTime: formatTimeField(startTime.toString(), timeSettings),
    endDate: formatDateField(endTime.toString(), timeSettings),
    endTime: formatTimeField(endTime.toString(), timeSettings),
    repeat: (fe.body.repeat || 1).toString(),
    timeUnit: fe.body.time_unit,
    executable_type: fe.body.executable_type,
    executable_id: (fe.body.executable_id || "").toString(),
    timeSettings,
    body: fe.body.body,
  };
}

const startTimeWarning = () => {
  const message =
    t("Event start time needs to be in the future, not the past.");
  const title = t("Unable to save event.");
  error(message, { title });
};

const nothingToRunWarning = () => {
  const message =
    t("All items scheduled before the start time. Nothing to run.");
  const title = t("Unable to save event.");
  error(message, { title });
};

type RecombineOptions = { forceRegimensToMidnight: boolean };

/** Take a FormViewModel and recombine the fields into a FarmEvent
 * that can be used to apply updates (such as a PUT request to the API). */
export function recombine(vm: FarmEventViewModel,
  options: RecombineOptions): TaggedFarmEvent["body"] {
  // Make sure that `repeat` is set to `never` when dealing with regimens.
  const isReg = vm.executable_type === "Regimen";
  const startTime = isReg && options.forceRegimensToMidnight
    ? "00:00"
    : vm.startTime;
  return {
    id: vm.id,
    start_time: offsetTime(vm.startDate, startTime, vm.timeSettings),
    end_time: offsetTime(vm.endDate, vm.endTime, vm.timeSettings),
    repeat: parseInt(vm.repeat, 10) || 1,
    time_unit: (isReg ? "never" : vm.timeUnit) as TimeUnit,
    executable_id: parseIntInput(vm.executable_id),
    executable_type: vm.executable_type as ("Sequence" | "Regimen"),
    body: vm.body,
  };
}

export function offsetTime(
  date: string, time: string, timeSettings: TimeSettings): string {
  const out = moment(date);
  const [hrs, min] = time.split(":").map(x => parseInt(x));
  out.hours(hrs);
  out.minutes(min);
  const utcOffsetDifference = moment().utcOffset() / 60 - timeSettings.utcOffset;
  return out.add(utcOffsetDifference, "hours").toISOString();
}

export interface EditFEProps {
  deviceTimezone: string | undefined;
  executableOptions: DropDownItem[];
  repeatOptions: DropDownItem[];
  farmEvent: TaggedFarmEvent;
  dispatch: Function;
  findExecutable: ExecutableQuery;
  title: string;
  timeSettings: TimeSettings;
  resources: ResourceIndex;
  setSpecialStatus(specialStatus: SpecialStatus): void;
}

interface EditFEFormState {
  /**
   * Hold a partial FarmEvent locally containing only updates made by the form.
   */
  fe: Partial<FarmEventViewModel>;
  variablesCollapsed: boolean;
}

/**
 * This form has local state and does not cause any global state changes when
 * editing.
 *
 * Example: Navigating away from the page while editing will discard changes.
 */
export class EditFEForm extends React.Component<EditFEProps, EditFEFormState> {
  state: EditFEFormState = {
    fe: {},
    variablesCollapsed: false,
  };

  /** API data for the FarmEvent to which form updates can be applied. */
  get viewModel() {
    return destructureFarmEvent(this.props.farmEvent, this.props.timeSettings);
  }

  get executable() {
    const et = this.fieldGet("executable_type");
    const id = parseInt(this.fieldGet("executable_id"));
    if (et === "Sequence" || et === "Regimen") {
      return this.props.findExecutable(et, id);
    } else {
      throw new Error(`${et} is not a valid executable_type`);
    }
  }

  get isReg() {
    return this.fieldGet("executable_type") === "Regimen";
  }

  /** Executable requires variables or a user has manually added bodyVariables. */
  get needsVariables() {
    const varData = this.props.resources.sequenceMetas[this.executable.uuid];
    return Object.keys(varData || {}).length > 0;
  }

  get variableData() {
    if (this.executable.kind === "Regimen") {
      const regimenVariables = this.executable.body.body;
      return getRegimenVariableData(regimenVariables, this.props.resources);
    }
    return this.props.resources.sequenceMetas[this.executable.uuid];
  }

  get bodyVariables(): ParameterApplication[] {
    return this.state.fe.body || this.props.farmEvent.body.body || [];
  }

  overwriteStateFEBody = (newBody: ParameterApplication[]) => {
    const state = this.state;
    state.fe.body = newBody;
    this.setState(state);
  };

  editBodyVariables = (bodyVariables: ParameterApplication[]) =>
    (variable: ParameterApplication) => {
      const body = addOrEditParamApps(bodyVariables, variable);
      this.overwriteStateFEBody(body);
      this.props.setSpecialStatus(SpecialStatus.DIRTY);
    };

  LocalsList = () => <LocalsList
    locationDropdownKey={JSON.stringify(this.bodyVariables)}
    bodyVariables={this.bodyVariables}
    variableData={this.variableData}
    sequenceUuid={this.executable.uuid}
    resources={this.props.resources}
    onChange={this.editBodyVariables(this.bodyVariables)}
    allowedVariableNodes={AllowedVariableNodes.variable} />;

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  executableSet = (ddi: DropDownItem) => {
    if (ddi.value) {
      const { id, executable_type } = this.props.farmEvent.body;
      const prev_executable_type = executable_type;
      const next_executable_type = executableType(ddi.headingId);
      if (id && prev_executable_type !== next_executable_type) {
        error(t("Cannot change between Sequences and Regimens."));
        this.navigate(Path.farmEvents());
      } else {
        const { uuid } = this.props.findExecutable(
          next_executable_type, parseInt("" + ddi.value));
        const varData = this.props.resources.sequenceMetas[uuid];
        const update: EditFEFormState = {
          fe: {
            executable_type: next_executable_type,
            executable_id: ddi.value.toString(),
          },
          variablesCollapsed: this.state.variablesCollapsed,
        };
        this.overwriteStateFEBody(variableList(varData) || []);
        this.setState(betterMerge(this.state, update));
        this.props.setSpecialStatus(SpecialStatus.DIRTY);
      }
    }
  };

  executableGet = (): DropDownItem => {
    const headingId: ExecutableType =
      (this.executable.kind === "Sequence") ? "Sequence" : "Regimen";
    return {
      value: this.executable.body.id || 0,
      label: this.executable.body.name,
      headingId
    };
  };

  fieldSet = (key: FarmEventViewModelKey, value: string) => {
    // A merge is required to not overwrite `fe`.
    this.setState(betterMerge(this.state, { fe: { [key]: value } }));
    this.props.setSpecialStatus(SpecialStatus.DIRTY);
  };

  fieldGet = (key: FarmEventViewModelKey): string =>
    (this.state.fe[key] || this.viewModel[key] || "").toString();

  allItemTimes = (fe: FarmEvent, now: moment.Moment,
  ): moment.Moment[] | undefined => {
    const { timeSettings } = this.props;
    const kind = fe.executable_type;
    const start = fe.start_time;
    const isRegimen = (x: TaggedSequence | TaggedRegimen): x is TaggedRegimen =>
      !!(x.kind === "Regimen");
    switch (kind) {
      case "Sequence":
        return scheduleForFarmEvent(fe, now).items;
      case "Regimen":
        const r = this.props.findExecutable(kind, fe.executable_id);
        const items = isRegimen(r)
          ? nextRegItemTimes(r.body.regimen_items, start, now, timeSettings)
          : undefined;
        return items;
      default:
        throw new Error(`${kind} is not a valid executable_type`);
    }
  };

  nextItemTime = (fe: FarmEvent, now: moment.Moment,
  ): moment.Moment | undefined => {
    const items = this.allItemTimes(fe, now);
    const futureStartTimeFallback = moment(fe.start_time) > now
      ? moment(fe.start_time)
      : undefined;
    return first(items) || futureStartTimeFallback;
  };

  /** Rejects save of Farm Event if: */
  maybeRejectStartTime = (f: FarmEvent, now = moment()) => {
    /** adding a new event (editing repeats for ongoing events is allowed) */
    const newEvent = this.props.title.toLowerCase().includes("add");
    /** start time is in the past */
    const inThePast = moment(f.start_time) < now;
    /** is a sequence event */
    const sequenceEvent = !this.isReg;
    return newEvent && (inThePast && sequenceEvent);
  };

  /** Merge and recombine FarmEvent form updates into and updated FarmEvent. */
  get updatedFarmEvent() {
    /** ViewModel with INVALID `body` (must be replaced). */
    const vm = betterMerge(this.viewModel, this.state.fe);
    const oldBodyData = this.needsVariables ? this.viewModel.body : [];
    vm.body = this.state.fe.body || oldBodyData;
    const opts: RecombineOptions = { forceRegimensToMidnight: true };
    return recombine(vm, opts);
  }

  /**  Once saved, if
  *    - Regimen Farm Event:
  *      * If scheduled for today, warn about the possibility of missing tasks.
  *      * Display the start time difference from now.
  *      * Return to calendar view.
  *    - Sequence Farm Event:
  *      * Determine the time for the next item to be run.
  *      * Return to calendar view.
  */
  commitViewModel = (now = moment()) => {
    if (this.maybeRejectStartTime(this.updatedFarmEvent)) {
      return startTimeWarning();
    }
    const nextRun = this.nextItemTime(this.updatedFarmEvent, now);
    if (!nextRun) {
      return nothingToRunWarning();
    }
    const { dispatch } = this.props;
    dispatch(overwrite(this.props.farmEvent, this.updatedFarmEvent));
    dispatch(save(this.props.farmEvent.uuid))
      .then(() => {
        this.props.setSpecialStatus(SpecialStatus.SAVED);
        dispatch(maybeWarnAboutMissedTasks(this.props.farmEvent,
          () => alert(t(Content.REGIMEN_TODAY_SKIPPED_ITEM_RISK)), now));
        success(t("The next item in this event will run {{timeFromNow}}.",
          { timeFromNow: nextRun.from(now) }));
        const warn = some(
          (this.allItemTimes(this.updatedFarmEvent, now) as moment.Moment[])
            .map(item => nearOsUpdateTime(timeToMs(item.format("HH:mm")),
              getDeviceAccountSettings(this.props.resources).body.ota_hour)));
        warn && warning(Content.WITHIN_HOUR_OF_OS_UPDATE);
        this.navigate(Path.farmEvents());
      })
      .catch(() => {
        error(t("Unable to save event."));
        this.props.setSpecialStatus(SpecialStatus.DIRTY);
      });
  };

  toggleVarShow = () =>
    this.setState({ variablesCollapsed: !this.state.variablesCollapsed });

  render() {
    const variableCount = Object.values(this.variableData || {})
      .filter(v => v?.celeryNode.kind == "parameter_declaration")
      .length;
    return <div className="edit-farm-event-form">
      <ErrorBoundary>
        <FarmEventForm
          isRegimen={this.isReg}
          fieldGet={this.fieldGet}
          fieldSet={this.fieldSet}
          timeSettings={this.props.timeSettings}
          executableOptions={this.props.executableOptions}
          executableSet={this.executableSet}
          executableGet={this.executableGet}
          dispatch={this.props.dispatch}>
          <div className={"farm-event-form-content"}>
            {variableCount > 0 &&
              <SectionHeader title={t("Variables")}
                count={variableCount}
                collapsed={this.state.variablesCollapsed}
                toggle={this.toggleVarShow} />}
            <Collapse isOpen={!this.state.variablesCollapsed}>
              <ErrorBoundary>
                <this.LocalsList />
              </ErrorBoundary>
            </Collapse>
          </div>
        </FarmEventForm>
      </ErrorBoundary>
      <TzWarning deviceTimezone={this.props.deviceTimezone} />
    </div>;
  }
}

export interface StartTimeFormProps {
  isRegimen: boolean;
  fieldGet(key: FarmEventViewModelKey): string;
  fieldSet(key: FarmEventViewModelKey, value: string): void;
  timeSettings: TimeSettings;
  now?: moment.Moment;
  disabled?: boolean;
}

export const StartTimeForm = (props: StartTimeFormProps) => {
  const forceMidnight = props.isRegimen;
  const isNew = !parseInt("" + props.fieldGet("id"));
  const startDatetimeError = isNew && !forceMidnight &&
    !moment(props.now).isBefore(moment(offsetTime(props.fieldGet("startDate"),
      props.fieldGet("startTime"), props.timeSettings)))
    ? t("Start time and date must be in the future.")
    : undefined;
  return <div className="start-time-form">
    <label>
      {t("Starts")}
    </label>
    <Row>
      <BlurableInput
        type="date"
        disabled={props.disabled}
        className="add-event-start-date"
        name="start_date"
        value={props.fieldGet("startDate")}
        error={startDatetimeError}
        onCommit={e => props.fieldSet("startDate", e.currentTarget.value)} />
      <EventTimePicker
        className="add-event-start-time"
        name="start_time"
        timeSettings={props.timeSettings}
        value={props.fieldGet("startTime")}
        error={startDatetimeError}
        onCommit={e => props.fieldSet("startTime", e.currentTarget.value)}
        disabled={props.disabled || forceMidnight}
        hidden={forceMidnight} />
    </Row>
  </div>;
};

export interface RepeatFormProps {
  isRegimen: boolean;
  fieldGet(key: FarmEventViewModelKey): string;
  fieldSet(key: FarmEventViewModelKey, value: string): void;
  timeSettings: TimeSettings;
  disabled?: boolean;
}

export const RepeatForm = (props: RepeatFormProps) => {
  const allowRepeat = !props.isRegimen && props.fieldGet("timeUnit") !== NEVER;
  return <div className="farm-event-repeat-options grid">
    {!props.isRegimen
      ? <label>
        <input type="checkbox"
          name="timeUnit"
          onChange={e => props.fieldSet("timeUnit",
            (!e.currentTarget.checked || props.isRegimen) ? "never" : "daily")}
          disabled={props.disabled || props.isRegimen}
          checked={allowRepeat} />
        {t("Repeats?")}
      </label>
      : <div className={"no-repeat"} />}
    <FarmEventRepeatForm
      timeSettings={props.timeSettings}
      disabled={!allowRepeat}
      hidden={!allowRepeat}
      fieldSet={props.fieldSet}
      timeUnit={props.fieldGet("timeUnit") as TimeUnit}
      repeat={props.fieldGet("repeat")}
      endDate={props.fieldGet("endDate")}
      endTime={props.fieldGet("endTime")}
      dateError={dateCheck(props.fieldGet)}
      timeError={timeCheck(props.fieldGet, props.timeSettings)} />
  </div>;
};

const dateCheck = (
  fieldGet: (key: FarmEventViewModelKey) => string,
): string | undefined => {
  const startDate = fieldGet("startDate");
  const endDate = fieldGet("endDate");
  if (!moment(endDate).isSameOrAfter(moment(startDate))) {
    return t("End date must not be before start date.");
  }
};

const timeCheck = (
  fieldGet: (key: FarmEventViewModelKey) => string,
  timeSettings: TimeSettings,
): string | undefined => {
  const startDate = fieldGet("startDate");
  const startTime = fieldGet("startTime");
  const endDate = fieldGet("endDate");
  const endTime = fieldGet("endTime");
  const start = offsetTime(startDate, startTime, timeSettings);
  const end = offsetTime(endDate, endTime, timeSettings);
  if (moment(start).isSameOrAfter(moment(end))) {
    return t("End time must be after start time.");
  }
};

interface FarmEventFormProps {
  isRegimen: boolean;
  fieldGet(key: FarmEventViewModelKey): string;
  fieldSet(key: FarmEventViewModelKey, value: string): void;
  timeSettings: TimeSettings;
  executableOptions: DropDownItem[];
  executableSet(ddi: DropDownItem): void;
  executableGet(): DropDownItem | undefined;
  dispatch: Function;
  children?: React.ReactNode;
}

export const FarmEventForm = (props: FarmEventFormProps) => {
  const { isRegimen, fieldGet, fieldSet, timeSettings } = props;
  return <div className="farm-event-form grid">
    <div>
      <label>
        {t("Sequence or Regimen")}
      </label>
      {props.executableOptions.filter(x => !x.heading).length < 1 &&
        <Help
          text={Content.MISSING_EXECUTABLE}
          customIcon={"fa-exclamation-triangle"} />}
      <FBSelect
        list={props.executableOptions}
        onChange={props.executableSet}
        selectedItem={props.executableGet()} />
      {props.children}
    </div>
    <StartTimeForm
      disabled={!props.executableGet()}
      isRegimen={isRegimen}
      fieldGet={fieldGet}
      fieldSet={fieldSet}
      timeSettings={timeSettings} />
    <RepeatForm
      disabled={!props.executableGet()}
      isRegimen={isRegimen}
      fieldGet={fieldGet}
      fieldSet={fieldSet}
      timeSettings={props.timeSettings} />
  </div>;
};
