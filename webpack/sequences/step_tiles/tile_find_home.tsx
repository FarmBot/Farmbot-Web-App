import * as React from "react";
import { t } from "i18next";
import { splice, remove } from "./index";
import { StepTitleBar } from "./step_title_bar";
import { FindHome, ALLOWED_AXIS } from "farmbot";
import { StepParams } from "../interfaces";
import { TaggedSequence } from "../../resources/tagged_resources";
import { ResourceIndex } from "../../resources/interfaces";
import { overwrite } from "../../api/crud";
import { defensiveClone } from "../../util";
import { ToolTips } from "../../constants";
import { StepIconGroup } from "../step_icon_group";

export function TileFindHome(props: StepParams) {
  if (props.currentStep.kind === "find_home") {
    return <InnerFindHome
      currentStep={props.currentStep}
      currentSequence={props.currentSequence}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources} />;
  } else {
    throw new Error("TileFindHome expects send_message");
  }
}
interface FindHomeParams {
  currentStep: FindHome;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}

const AXIS_CHOICES: ALLOWED_AXIS[] = ["x", "y", "z", "all"];

class InnerFindHome extends React.Component<FindHomeParams, {}> {

  isSelected = (axis: ALLOWED_AXIS) => {
    return this.props.currentStep.args.axis === axis;
  };

  handleUpdate = (axis: ALLOWED_AXIS) => {
    let update = defensiveClone(this.props.currentStep);
    let nextSequence = defensiveClone(this.props.currentSequence).body;
    update.args.axis = axis;
    (nextSequence.body || [])[this.props.index] = update;
    this.props.dispatch(overwrite(this.props.currentSequence, nextSequence));
  }

  render() {
    let { dispatch, index, currentStep, currentSequence } = this.props;

    return <div>
      <div className="step-wrapper">
        <div className="row">
          <div className="col-sm-12">
            <div className="step-header find-home-step">
              <StepTitleBar index={index}
                dispatch={dispatch}
                step={currentStep}
                sequence={currentSequence} />
              <StepIconGroup
                onTrash={() => remove({ dispatch, index, sequence: currentSequence })}
                onClone={() => dispatch(splice({
                  step: currentStep,
                  sequence: currentSequence,
                  index
                }))}
                helpText={t(ToolTips.FIND_HOME)} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="step-content find-home-step">
              <div className="row">
                <div className="col-xs-12">
                  <div className="bottom-content">
                    <div className="channel-fields">
                      <form>
                        {AXIS_CHOICES.map((axis, i) => {
                          return <div key={i} style={{ display: "inline" }}>
                            <label>
                              <input type="radio"
                                value={axis}
                                onChange={(e) => {
                                  let nextVal =
                                    e.currentTarget.value as typeof axis;
                                  this.handleUpdate(nextVal);
                                }}
                                checked={this.isSelected(axis)} />
                              {" "} Find {axis}
                            </label>
                          </div>;
                        })}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}
