import * as React from "react";
import * as moment from "moment";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import {
  TaggedFarmEvent, SpecialStatus, TaggedSequence, TaggedRegimen,
  VariableDeclaration
} from "farmbot";
import { ExecutableQuery } from "../interfaces";
import { formatTime, formatDate } from "./map_state_to_props_add_edit";
import {
  BlurableInput,
  Col, Row,
  SaveBtn,
  FBSelect,
  DropDownItem
} from "../../ui";
import { destroy, save, overwrite } from "../../api/crud";
import { history } from "../../history";
// TIL: https://stackoverflow.com/a/24900248/1064917
import { betterMerge } from "../../util";
import { maybeWarnAboutMissedTasks } from "./util";
import { FarmEventRepeatForm } from "./farm_event_repeat_form";
import { scheduleForFarmEvent } from "./calendar/scheduler";
import { executableType } from "../util";
import { Content } from "../../constants";
import { destroyOK } from "../../resources/actions";
import { EventTimePicker } from "./event_time_picker";
import { TzWarning } from "./tz_warning";
import { nextRegItemTimes } from "./map_state_to_props";
import { first } from "lodash";
import {
  TimeUnit, ExecutableType, FarmEvent
} from "farmbot/dist/resources/api_resources";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../plants/designer_panel";
import { LocalsList } from "../../sequences/locals_list/locals_list";
import { ResourceIndex } from "../../resources/interfaces";
import { ShouldDisplay, Feature } from "../../devices/interfaces";
import {
  addOrEditVarDeclaration, declarationList, getRegimenVariableData
} from "../../sequences/locals_list/declaration_support";
import {
  AllowedDeclaration
} from "../../sequences/locals_list/locals_list_support";

type FormEvent = React.SyntheticEvent<HTMLInputElement>;
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
  timeOffset: number;
  body?: VariableDeclaration[];
}

/** Breaks up a TaggedFarmEvent into a structure that can easily be used
 * by the edit form.
 * USE CASE EXAMPLE: We have a "date" and "time" field that are created from
 *                   a single "start_time" FarmEvent field. */
export function destructureFarmEvent(
  fe: TaggedFarmEvent, timeOffset: number): FarmEventViewModel {

  return {
    id: fe.body.id,
    startDate: formatDate((fe.body.start_time).toString(), timeOffset),
    startTime: formatTime((fe.body.start_time).toString(), timeOffset),
    endDate: formatDate((fe.body.end_time || new Date()).toString(), timeOffset),
    endTime: formatTime((fe.body.end_time || new Date()).toString(), timeOffset),
    repeat: (fe.body.repeat || 1).toString(),
    timeUnit: fe.body.time_unit,
    executable_type: fe.body.executable_type,
    executable_id: (fe.body.executable_id || "").toString(),
    timeOffset,
    body: fe.body.body,
  };
}

const startTimeWarning = () => {
  const message =
    t("FarmEvent start time needs to be in the future, not the past.");
  const title = t("Unable to save farm event.");
  error(message, title);
};

type RecombineOptions = { forceRegimensToMidnight: boolean };

/** Take a FormViewModel and recombine the fields into a FarmEvent
 * that can be used to apply updates (such as a PUT request to the API). */
export function recombine(vm: FarmEventViewModel,
  options: RecombineOptions): TaggedFarmEvent["body"] {
  // Make sure that `repeat` is set to `never` when dealing with regimens.
  const isReg = vm.executable_type === "Regimen";
  const startTime = isReg && options.forceRegimensToMidnight
    ? "00:00" : vm.startTime;
  return {
    id: vm.id,
    start_time: offsetTime(vm.startDate, startTime, vm.timeOffset),
    end_time: offsetTime(vm.endDate, vm.endTime, vm.timeOffset),
    repeat: parseInt(vm.repeat, 10) || 1,
    time_unit: (isReg ? "never" : vm.timeUnit) as TimeUnit,
    executable_id: parseInt(vm.executable_id, 10),
    executable_type: vm.executable_type as ("Sequence" | "Regimen"),
    body: vm.body,
  };
}

export function offsetTime(date: string, time: string, offset: number): string {
  const out = moment(date).utcOffset(offset);
  const [hrs, min] = time.split(":").map(x => parseInt(x));
  out.hours(hrs);
  out.minutes(min);
  return out.toISOString();
}

export interface EditFEProps {
  deviceTimezone: string | undefined;
  executableOptions: DropDownItem[];
  repeatOptions: DropDownItem[];
  farmEvent: TaggedFarmEvent;
  dispatch: Function;
  findExecutable: ExecutableQuery;
  title: string;
  deleteBtn?: boolean;
  timeOffset: number;
  autoSyncEnabled: boolean;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
}

interface State {
  /**
   * Hold a partial FarmEvent locally containing only updates made by the form.
   */
  fe: Partial<FarmEventViewModel>;
  /**
   * This form has local state and does not cause any global state changes when
   * editing.
   *
   * Example: Navigating away from the page while editing will discard changes.
   */
  specialStatusLocal: SpecialStatus;
}

export class EditFEForm extends React.Component<EditFEProps, State> {
  state: State = { fe: {}, specialStatusLocal: SpecialStatus.SAVED };

  get repeats() { return this.fieldGet("timeUnit") !== NEVER; }

  get dispatch() { return this.props.dispatch; }

  /** API data for the FarmEvent to which form updates can be applied. */
  get viewModel() {
    return destructureFarmEvent(this.props.farmEvent, this.props.timeOffset);
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

  /** Executable requires variables or a user has manually added declarations. */
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

  get declarations(): VariableDeclaration[] | undefined {
    return this.state.fe.body || this.props.farmEvent.body.body;
  }

  overwriteStateFEBody = (newBody: VariableDeclaration[]) => {
    const state = this.state;
    state.fe.body = newBody;
    this.setState(state);
  }

  editDeclaration = (declarations: VariableDeclaration[]) =>
    (declaration: VariableDeclaration) => {
      const body = addOrEditVarDeclaration(declarations, declaration);
      this.overwriteStateFEBody(body);
      this.setState({ specialStatusLocal: SpecialStatus.DIRTY });
    }

  LocalsList = () => <LocalsList
    declarations={this.declarations}
    variableData={this.variableData}
    sequenceUuid={this.executable.uuid}
    resources={this.props.resources}
    onChange={this.editDeclaration(this.declarations || [])}
    allowedDeclarations={AllowedDeclaration.variable}
    shouldDisplay={this.props.shouldDisplay} />

  executableSet = (e: DropDownItem) => {
    if (e.value) {
      const { executable_type } = this.props.farmEvent.body;
      if (executable_type === "Regimen" &&
        executableType(e.headingId) === "Sequence") {
        error(t("Cannot change from a Regimen to a Sequence."));
        history.push("/app/designer/farm_events");
      } else {
        const { uuid } =
          this.props.findExecutable(executable_type, parseInt("" + e.value));
        const varData = this.props.resources.sequenceMetas[uuid];
        const update: State = {
          fe: {
            executable_type: executableType(e.headingId),
            executable_id: (e.value || "").toString(),
          },
          specialStatusLocal: SpecialStatus.DIRTY
        };
        this.overwriteStateFEBody(declarationList(varData) || []);
        this.setState(betterMerge(this.state, update));
      }
    }
  }

  executableGet = (): DropDownItem => {
    const headingId: ExecutableType =
      (this.executable.kind === "Sequence") ? "Sequence" : "Regimen";
    return {
      value: this.executable.body.id || 0,
      label: this.executable.body.name,
      headingId
    };
  }

  fieldSet = (name: keyof State["fe"]) => (e: FormEvent) => {
    this.setState(betterMerge(this.state, {
      fe: { [name]: e.currentTarget.value },
      specialStatusLocal: SpecialStatus.DIRTY
    }));
  }

  fieldGet = (name: keyof State["fe"]): string => {
    return (this.state.fe[name] || this.viewModel[name] || "").toString();
  }

  mergeState = (k: keyof FarmEventViewModel, v: string) => {
    this.setState(betterMerge(this.state, {
      fe: { [k]: v },
      specialStatusLocal: SpecialStatus.DIRTY
    }));
  }

  toggleRepeat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.currentTarget;
    this.mergeState("timeUnit", (!checked || this.isReg) ? "never" : "daily");
  };

  nextItemTime = (fe: FarmEvent, now: moment.Moment
  ): moment.Moment | undefined => {
    const tz_offset = this.props.timeOffset;
    const kind = fe.executable_type;
    const start = fe.start_time;
    const isRegimen = (x: TaggedSequence | TaggedRegimen): x is TaggedRegimen =>
      !!(x.kind === "Regimen");
    switch (kind) {
      case "Sequence":
        return first(scheduleForFarmEvent(fe, now).items);
      case "Regimen":
        const r = this.props.findExecutable(kind, fe.executable_id);
        const nextItem = isRegimen(r)
          ? first(nextRegItemTimes(r.body.regimen_items, start, now, tz_offset))
          : undefined;
        const futureStartTimeFallback = moment(start) > now
          ? moment(start)
          : undefined;
        return nextItem || futureStartTimeFallback;
      default:
        throw new Error(`${kind} is not a valid executable_type`);
    }
  }

  get allowRegimenBackscheduling() {
    return this.props.shouldDisplay(Feature.backscheduled_regimens);
  }

  /** Rejects save of Farm Event if: */
  maybeRejectStartTime = (f: FarmEvent, now = moment()) => {
    /** adding a new event (editing repeats for ongoing events is allowed) */
    const newEvent = this.props.title.toLowerCase().includes("add");
    /** start time is in the past */
    const inThePast = moment(f.start_time) < now;
    /** is a sequence event or: */
    const sequenceEvent = !this.isReg;
    /** installed FBOS does not support backscheduling of regimen farm events.
     *  (this is the main reason this is a frontend validation)
     */
    const unsupportedOS = !this.allowRegimenBackscheduling;
    return newEvent && (inThePast && (sequenceEvent || unsupportedOS));
  }

  /** Merge and recombine FarmEvent form updates into and updated FarmEvent. */
  get updatedFarmEvent() {
    /** ViewModel with INVALID `body` (must be replaced). */
    const vm = betterMerge(this.viewModel, this.state.fe);
    const oldBodyData = this.needsVariables ? this.viewModel.body : [];
    vm.body = this.state.fe.body || oldBodyData;
    const opts: RecombineOptions = {
      forceRegimensToMidnight: this.allowRegimenBackscheduling
    };
    return recombine(vm, opts);
  }

  /** Use the next item run time to display toast messages and return to
   * the form if necessary. */
  nextRunTimeActions = (editFEPath: string, now = moment()) => {
    const nextRun = this.nextItemTime(this.props.farmEvent.body, now);
    if (nextRun) {
      const nextRunText = this.props.autoSyncEnabled
        ? t(`The next item in this Farm Event will run {{timeFromNow}}.`,
          { timeFromNow: nextRun.from(now) })
        : t(`The next item in this Farm Event will run {{timeFromNow}}, but
      you must first SYNC YOUR DEVICE. If you do not sync, the event will
      not run.`.replace(/\s+/g, " "), { timeFromNow: nextRun.from(now) });
      success(nextRunText);
    } else {
      history.push(editFEPath);
      error(t(Content.INVALID_RUN_TIME), t("Warning"));
    }
  }

  /**  Once saved, if
  *    - Regimen Farm Event:
  *      * Return to calendar view.
  *      * If scheduled for today, warn about the possibility of missing tasks.
  *      * Display the start time difference from now and maybe prompt to sync.
  *    - Sequence Farm Event:
  *      * Determine the time for the next item to be run.
  *      * Return to calendar view only if more items exist to be run.
  *      * Display the next item run time.
  *      * If auto-sync is disabled, prompt the user to sync.
  */
  commitViewModel = (now = moment()) => {
    if (this.maybeRejectStartTime(this.updatedFarmEvent)) {
      return startTimeWarning();
    }
    this.dispatch(overwrite(this.props.farmEvent, this.updatedFarmEvent));
    const editFEPath = window.location.pathname;
    this.dispatch(save(this.props.farmEvent.uuid))
      .then(() => {
        this.setState({ specialStatusLocal: SpecialStatus.SAVED });
        history.push("/app/designer/farm_events");
        this.dispatch(maybeWarnAboutMissedTasks(this.props.farmEvent,
          () => alert(t(Content.REGIMEN_TODAY_SKIPPED_ITEM_RISK)), now));
        this.nextRunTimeActions(editFEPath, now);
      })
      .catch(() => {
        error(t("Unable to save farm event."));
        this.setState({ specialStatusLocal: SpecialStatus.DIRTY });
      });
  }

  StartTimeForm = () => {
    const forceMidnight = this.isReg && this.allowRegimenBackscheduling;
    return <div>
      <label>
        {t("Starts")}
      </label>
      <Row>
        <Col xs={6}>
          <BlurableInput
            type="date"
            className="add-event-start-date"
            name="start_date"
            value={this.fieldGet("startDate")}
            onCommit={this.fieldSet("startDate")} />
        </Col>
        <Col xs={6}>
          <EventTimePicker
            className="add-event-start-time"
            name="start_time"
            tzOffset={this.props.timeOffset}
            value={this.fieldGet("startTime")}
            onCommit={this.fieldSet("startTime")}
            disabled={forceMidnight}
            hidden={forceMidnight} />
        </Col>
      </Row>
    </div>;
  }

  RepeatCheckbox = ({ allowRepeat }: { allowRepeat: boolean }) =>
    !this.isReg ?
      <label>
        <input type="checkbox"
          onChange={this.toggleRepeat}
          disabled={this.isReg}
          checked={allowRepeat} />
        &nbsp;{t("Repeats?")}
      </label> : <div />

  RepeatForm = () => {
    const allowRepeat = !this.isReg && this.repeats;
    return <div>
      <this.RepeatCheckbox allowRepeat={allowRepeat} />
      <FarmEventRepeatForm
        tzOffset={this.props.timeOffset}
        disabled={!allowRepeat}
        hidden={!allowRepeat}
        onChange={this.mergeState}
        timeUnit={this.fieldGet("timeUnit") as TimeUnit}
        repeat={this.fieldGet("repeat")}
        endDate={this.fieldGet("endDate")}
        endTime={this.fieldGet("endTime")} />
    </div>;
  }

  FarmEventDeleteButton = () =>
    <button className="fb-button red" hidden={!this.props.deleteBtn}
      onClick={() => {
        this.dispatch(destroy(this.props.farmEvent.uuid))
          .then(() => {
            history.push("/app/designer/farm_events");
            success(t("Deleted farm event."), t("Deleted"));
          });
      }}>
      {t("Delete")}
    </button>

  render() {
    const { farmEvent } = this.props;
    return <DesignerPanel panelName={"add-farm-event"} panelColor={"magenta"}>
      <DesignerPanelHeader
        panelName={"add-farm-event"}
        panelColor={"magenta"}
        title={this.props.title}
        onBack={!farmEvent.body.id ? () =>
          // Throw out unsaved farmevents.
          this.props.dispatch(destroyOK(farmEvent))
          : undefined} />
      <DesignerPanelContent panelName={"add-farm-event"}>
        <label>
          {t("Sequence or Regimen")}
        </label>
        <FBSelect
          list={this.props.executableOptions}
          onChange={this.executableSet}
          selectedItem={this.executableGet()} />
        <this.LocalsList />
        <this.StartTimeForm />
        <this.RepeatForm />
        <SaveBtn
          status={farmEvent.specialStatus || this.state.specialStatusLocal}
          color="magenta"
          onClick={() => this.commitViewModel()} />
        <this.FarmEventDeleteButton />
        <TzWarning deviceTimezone={this.props.deviceTimezone} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
