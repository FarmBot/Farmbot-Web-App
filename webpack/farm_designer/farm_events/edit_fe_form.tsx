import * as React from "react";
import * as moment from "moment";
import * as _ from "lodash";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { TaggedFarmEvent, SpecialStatus } from "../../resources/tagged_resources";
import { TimeUnit, ExecutableQuery, ExecutableType } from "../interfaces";
import { formatTime, formatDate } from "./map_state_to_props_add_edit";
import {
  BackArrow,
  BlurableInput,
  Col, Row,
  SaveBtn,
  FBSelect,
  DropDownItem
} from "../../ui/index";
import { destroy, save, edit } from "../../api/crud";
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

type FormEvent = React.SyntheticEvent<HTMLInputElement>;
export const NEVER: TimeUnit = "never";
/** Separate each of the form fields into their own interface. Recombined later
 * on save.
 */
export interface FarmEventViewModel {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  repeat: string;
  timeUnit: string;
  executable_type: string;
  executable_id: string;
  timeOffset: number;
}
/** Breaks up a TaggedFarmEvent into a structure that can easily be used
 * by the edit form.
 * USE CASE EXAMPLE: We have a "date" and "time" field that are created from
 *                   a single "start_time" FarmEvent field. */
export function destructureFarmEvent(fe: TaggedFarmEvent, timeOffset: number): FarmEventViewModel {

  return {
    startDate: formatDate((fe.body.start_time).toString(), timeOffset),
    startTime: formatTime((fe.body.start_time).toString(), timeOffset),
    endDate: formatDate((fe.body.end_time || new Date()).toString(), timeOffset),
    endTime: formatTime((fe.body.end_time || new Date()).toString(), timeOffset),
    repeat: (fe.body.repeat || 1).toString(),
    timeUnit: fe.body.time_unit,
    executable_type: fe.body.executable_type,
    executable_id: (fe.body.executable_id || "").toString(),
    timeOffset
  };
}

type PartialFE = Partial<TaggedFarmEvent["body"]>;

/** Take a FormViewModel and recombine the fields into a Partial<FarmEvent>
 * that can be used to apply updates (such as a PUT request to the API). */
export function recombine(vm: FarmEventViewModel): PartialFE {
  // Make sure that `repeat` is set to `never` when dealing with regimens.
  const isReg = vm.executable_type === "Regimen";
  return {
    start_time: offsetTime(vm.startDate, vm.startTime, vm.timeOffset),
    end_time: offsetTime(vm.endDate, vm.endTime, vm.timeOffset),
    repeat: parseInt(vm.repeat, 10) || 1,
    time_unit: (isReg ? "never" : vm.timeUnit) as TimeUnit,
    executable_id: parseInt(vm.executable_id, 10),
    executable_type: vm.executable_type as ("Sequence" | "Regimen"),
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
}

interface State {
  /** Hold a partial FarmEvent locally */
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

  get isOneTime() { return this.fieldGet("timeUnit") === NEVER; }

  get dispatch() { return this.props.dispatch; }

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

  executableSet = (e: DropDownItem) => {
    if (e.value) {
      const update: Partial<State> = {
        fe: {
          executable_type: executableType(e.headingId),
          executable_id: (e.value || "").toString()
        },
        specialStatusLocal: SpecialStatus.DIRTY
      };
      this.setState(betterMerge(this.state, update));
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

  commitViewModel = () => {
    const partial = recombine(betterMerge(this.viewModel, this.state.fe));
    this.dispatch(edit(this.props.farmEvent, partial));
    const EditFEPath = window.location.pathname;
    this
      .dispatch(save(this.props.farmEvent.uuid))
      .then(() => {
        this.setState({ specialStatusLocal: SpecialStatus.SAVED });
        history.push("/app/designer/farm_events");
        const frmEvnt = this.props.farmEvent;
        const nextRun = _.first(scheduleForFarmEvent(frmEvnt.body).items);
        if (nextRun) {
          const nextRunText = this.props.autoSyncEnabled
            ? t(`This Farm Event will run {{timeFromNow}}.`,
              { timeFromNow: nextRun.fromNow() })
            : t(`This Farm Event will run {{timeFromNow}}, but
            you must first SYNC YOUR DEVICE. If you do not sync, the event will
            not run.`.replace(/\s+/g, " "), { timeFromNow: nextRun.fromNow() });
          success(nextRunText);
          this.props.dispatch(maybeWarnAboutMissedTasks(frmEvnt, function () {
            alert(t(Content.REGIMEN_TODAY_SKIPPED_ITEM_RISK));
          }));
        } else {
          history.push(EditFEPath);
          error(t(Content.INVALID_RUN_TIME));
        }
      })
      .catch(() => {
        error(t("Unable to save farm event."));
        this.setState({ specialStatusLocal: SpecialStatus.DIRTY });
      });
  }
  get isReg() {
    return this.fieldGet("executable_type") === "Regimen";
  }

  render() {
    const fe = this.props.farmEvent;
    const repeats = this.fieldGet("timeUnit") !== NEVER;
    const allowRepeat = (!this.isReg && repeats);
    return <div className="panel-container magenta-panel add-farm-event-panel">
      <div className="panel-header magenta-panel">
        <p className="panel-title">
          <BackArrow onClick={() => {
            if (!this.props.farmEvent.body.id) {
              // Throw out unsaved farmevents.
              this.props.dispatch(destroyOK(this.props.farmEvent));
              return;
            }
          }} />
          {this.props.title}
        </p>
      </div>
      <div className="panel-content">
        <label>
          {t("Sequence or Regimen")}
        </label>
        <FBSelect
          list={this.props.executableOptions}
          onChange={this.executableSet}
          selectedItem={this.executableGet()} />
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
              onCommit={this.fieldSet("startTime")} />
          </Col>
        </Row>
        <label>
          <input type="checkbox"
            onChange={this.toggleRepeat}
            disabled={this.isReg}
            checked={repeats && !this.isReg} />
          &nbsp;{t("Repeats?")}
        </label>
        <FarmEventRepeatForm
          tzOffset={this.props.timeOffset}
          disabled={!allowRepeat}
          hidden={!allowRepeat}
          onChange={this.mergeState}
          timeUnit={this.fieldGet("timeUnit") as TimeUnit}
          repeat={this.fieldGet("repeat")}
          endDate={this.fieldGet("endDate")}
          endTime={this.fieldGet("endTime")} />
        <SaveBtn
          status={fe.specialStatus || this.state.specialStatusLocal}
          color="magenta"
          onClick={this.commitViewModel} />
        <button className="fb-button red" hidden={!this.props.deleteBtn}
          onClick={() => {
            this.dispatch(destroy(fe.uuid)).then(() => {
              history.push("/app/designer/farm_events");
              success(t("Deleted farm event."), t("Deleted"));
            });
          }}>
          {t("Delete")}
        </button>
        <TzWarning deviceTimezone={this.props.deviceTimezone} />
      </div>
    </div>;
  }
}
