import * as React from "react";
import { FindHome, ALLOWED_AXIS } from "farmbot";
import { StepParams } from "../interfaces";
import { TaggedSequence } from "../../resources/tagged_resources";
import { ResourceIndex } from "../../resources/interfaces";
import { overwrite } from "../../api/crud";
import { defensiveClone } from "../../util";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";

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
    const update = defensiveClone(this.props.currentStep);
    const nextSequence = defensiveClone(this.props.currentSequence).body;
    update.args.axis = axis;
    (nextSequence.body || [])[this.props.index] = update;
    this.props.dispatch(overwrite(this.props.currentSequence, nextSequence));
  }

  render() {
    const { dispatch, index, currentStep, currentSequence } = this.props;

    const className = "find-home-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.FIND_HOME}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index} />
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <div className="bottom-content">
              <div className="channel-fields">
                <form>
                  {AXIS_CHOICES.map((axis, i) => {
                    return <div key={i} style={{ display: "inline" }}>
                      <label>
                        <input type="radio"
                          value={axis}
                          onChange={(e) => {
                            const nextVal =
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
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
