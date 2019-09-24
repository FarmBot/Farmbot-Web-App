import * as React from "react";
import { Row, Col } from "../../ui/index";
import {
  TaggedSequence, SequenceBodyItem, ALLOWED_AXIS
} from "farmbot";
import { overwrite } from "../../api/crud";
import { defensiveClone } from "../../util";
import { t } from "../../i18next_wrapper";

export interface StepRadioProps {
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
  label: string;
}

const AXIS_CHOICES: ALLOWED_AXIS[] = ["x", "y", "z", "all"];

export function StepRadio(props: StepRadioProps) {
  const isSelected = (choice: ALLOWED_AXIS) => {
    if (props.currentStep.kind === "find_home") {
      return props.currentStep.args.axis === choice;
    }
  };

  const handleUpdate = (choice: ALLOWED_AXIS) => {
    const update = defensiveClone(props.currentStep);
    if (update.kind === "find_home") {
      const nextSequence = defensiveClone(props.currentSequence).body;
      update.args.axis = choice;
      (nextSequence.body || [])[props.index] = update;
      props.dispatch(overwrite(props.currentSequence, nextSequence));
    }
  };

  return <Row>
    <Col xs={12}>
      <div className="bottom-content">
        <div className="channel-fields">
          <form>
            {AXIS_CHOICES.map((choice, i) =>
              <div key={i} style={{ display: "inline" }}>
                <label>
                  <input type="radio"
                    value={choice}
                    onChange={e =>
                      handleUpdate(e.currentTarget.value as typeof choice)}
                    checked={isSelected(choice)} />
                  {` ${t(props.label)} ${choice}`}
                </label>
              </div>)}
          </form>
        </div>
      </div>
    </Col>
  </Row>;
}
