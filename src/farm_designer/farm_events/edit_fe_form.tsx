import * as React from "react";
import * as moment from "moment";
import * as _ from "lodash";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { TaggedFarmEvent } from "../../resources/tagged_resources";
import {
  TimeUnit,
  ExecutableQuery,
  ExecutableType
} from "../interfaces";
import {
  formatTime,
  formatDate,
  TightlyCoupledFarmEventDropDown
} from "./map_state_to_props_add_edit";
import {
  BackArrow,
  BlurableInput,
  Col,
  Row,
  SaveBtn
} from "../../ui/index";
import { FBSelect } from "../../ui/new_fb_select";
import {
  destroy,
  save,
  edit
} from "../../api/crud";
import { DropDownItem } from "../../ui/fb_select";
import { history } from "../../history";
// TIL: https://stackoverflow.com/a/24900248/1064917
import { betterMerge, fancyDebug } from "../../util";
import { maybeWarnAboutMissedTasks } from "./util";
import { TzWarning } from "./tz_warning";
import { FarmEventRepeatForm } from "./farm_event_repeat_form";

type FormEvent = React.SyntheticEvent<HTMLInputElement>;
const NEVER: TimeUnit = "never";
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
}
/** Breaks up a TaggedFarmEvent into a structure that can easily be used
 * by the edit form.
 * USE CASE EXAMPLE: We have a "date" and "time" field that are created from
 *                   a single "start_time" FarmEvent field. */
function destructureFarmEvent(fe: TaggedFarmEvent): FarmEventViewModel {
  return {
    startDate: formatDate((fe.body.start_time || new Date()).toString()),
    startTime: formatTime((fe.body.start_time || new Date()).toString()),
    endDate: formatDate((fe.body.end_time || new Date()).toString()),
    endTime: formatTime((fe.body.end_time || new Date()).toString()),
    repeat: (fe.body.repeat || 1).toString(),
    timeUnit: fe.body.time_unit,
    executable_type: fe.body.executable_type,
    executable_id: (fe.body.executable_id || "").toString()
  };
}

/** Take a FormViewModel and recombine the fields into a Partial<FarmEvent>
 * that can be used to apply updates (such as a PUT request to the API). */
function recombine(vm: FarmEventViewModel): Partial<TaggedFarmEvent["body"]> {
  return {
    start_time: moment(vm.startDate + " " + vm.startTime).toISOString(),
    end_time: moment(vm.endDate + " " + vm.endTime).toISOString(),
    repeat: parseInt(vm.repeat, 10),
    time_unit: vm.timeUnit as TimeUnit,
    executable_id: parseInt(vm.executable_id, 10),
    executable_type: vm.executable_type as ("Sequence" | "Regimen"),
  };
}

export interface EditFEProps {
  deviceTimezone: string | undefined;
  executableOptions: TightlyCoupledFarmEventDropDown[];
  repeatOptions: DropDownItem[];
  farmEvent: TaggedFarmEvent;
  dispatch: Function;
  findExecutable: ExecutableQuery;
  title: string;
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
  localCopyDirty: boolean;
}

export class EditFEForm extends React.Component<EditFEProps, State> {
  state: State = { fe: {}, localCopyDirty: false };

  get isOneTime() { return this.fieldGet("timeUnit") === NEVER; }

  get dispatch() { return this.props.dispatch; }

  get viewModel() { return destructureFarmEvent(this.props.farmEvent); }

  get executable() {
    let et = this.fieldGet("executable_type");
    let id = parseInt(this.fieldGet("executable_id"));
    if (et === "Sequence" || et === "Regimen") {
      return this.props.findExecutable(et, id);
    } else {
      throw new Error(`${et} is not a valid executable_type`);
    }
  }

  executableSet = (e: TightlyCoupledFarmEventDropDown) => {
    if (e.value) {
      this.setState(betterMerge(this.state, {
        fe: {
          executable_type: e.executable_type,
          executable_id: (e.value || "").toString()
        },
        localCopyDirty: true
      }));
    }
  }

  executableGet = (): TightlyCoupledFarmEventDropDown => {
    debugger;
    let executable_type: ExecutableType =
      (this.executable.kind === "sequences") ? "Sequence" : "Regimen";
    return {
      value: this.executable.body.id || 0,
      label: this.executable.body.name,
      executable_type
    };
  }

  fieldSet = (name: keyof State["fe"]) => (e: FormEvent) => {
    this.setState(betterMerge(this.state, {
      fe: { [name]: e.currentTarget.value },
      localCopyDirty: true
    }));
  }

  fieldGet = (name: keyof State["fe"]): string => {
    return (this.state.fe[name] || this.viewModel[name] || "").toString();
  }

  mergeState = (k: keyof FarmEventViewModel, v: string) => {
    this.setState(betterMerge(this.state, {
      fe: { [k]: v },
      localCopyDirty: true
    }));
  }

  toggleRepeat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.currentTarget;
    this.mergeState("timeUnit", (!checked || this.isReg) ? "never" : "daily");
  };

  commitViewModel = () => {
    let partial = recombine(betterMerge(this.viewModel, this.state.fe));
    this.dispatch(edit(this.props.farmEvent, partial));
    this
      .dispatch(save(this.props.farmEvent.uuid))
      .then(() => {
        history.push("/app/designer/farm_events");
        let frmEvnt = this.props.farmEvent;
        let nextRun = frmEvnt.body.calendar && frmEvnt.body.calendar[0];
        if (nextRun) {
          // TODO: Internationalizing this will be a challenge.
          success(`This Farm Event will run ${moment(nextRun).fromNow()}, but
            you must first SYNC YOUR DEVICE. If you do not sync, the event will\
            not run.`);
          this.props.dispatch(maybeWarnAboutMissedTasks(frmEvnt, function () {
            alert(`You are scheduling a regimen to run today. Be aware that
              running a regimen too late in the day may result in skipped
              regimen tasks. Consider rescheduling this event to tomorrow if
              this is a concern.`);
          }));
        } else {
          error(`This Farm Event does not appear to have a valid run time.
            Perhaps you entered bad dates?`);
        }
      })
      .catch(() => {
        error("Unable to save farm event.");
        this.setState(betterMerge(this.state, { localCopyDirty: false }));
      });
  }
  get isReg() {
    return this.fieldGet("executable_type") === "Regimen";
  }

  render() {
    let fe = this.props.farmEvent;
    let isSaving = fe.saving;
    let isDirty = fe.dirty || this.state.localCopyDirty;
    let isSaved = !isSaving && !isDirty;
    let repeats = this.fieldGet("timeUnit") !== NEVER;
    let allowRepeat = (!this.isReg && repeats);
    return <div className="panel-container magenta-panel add-farm-event-panel">
      <div className="panel-header magenta-panel">
        <p className="panel-title"> <BackArrow /> {this.props.title} </p>
      </div>
      <div className="panel-content">
        <label>
          {t("Sequence or Regimen")}
        </label>
        <FBSelect
          list={this.props.executableOptions}
          onChange={this.executableSet}
          selectedItem={this.executableGet()}
        />
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
              onCommit={this.fieldSet("startDate")}
            />
          </Col>
          <Col xs={6}>
            <BlurableInput type="time"
              className="add-event-start-time"
              name="start_time"
              value={this.fieldGet("startTime")}
              onCommit={this.fieldSet("startTime")}
            />
          </Col>
        </Row>
        <label>
          <input type="checkbox"
            onChange={this.toggleRepeat}
            disabled={this.isReg}
            checked={repeats && !this.isReg} />
          {t("Repeats?")}
        </label>
        <Row />
        {/* CHRIS HELP -RC */}
        <FarmEventRepeatForm
          disabled={!allowRepeat}
          hidden={!allowRepeat}
          onChange={this.mergeState}
          timeUnit={this.fieldGet("timeUnit") as TimeUnit}
          repeat={this.fieldGet("repeat")}
          endDate={this.fieldGet("endDate")}
          endTime={this.fieldGet("endTime")} />
        <SaveBtn
          color="magenta"
          isDirty={isDirty}
          isSaving={isSaving}
          isSaved={isSaved}
          onClick={this.commitViewModel}
        />
        <button className="fb-button red"
          onClick={() => {
            this.dispatch(destroy(fe.uuid)).then(() => {
              history.push("/app/designer/farm_events");
              success("Deleted farm event.", "Deleted");
            });
          }}>
          {t("Delete")}
        </button>
        <TzWarning deviceTimezone={this.props.deviceTimezone} />
      </div>
    </div>;
  }
}
