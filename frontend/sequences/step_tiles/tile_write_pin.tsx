import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { PinSelect, PinModeDropdown, PinValueField } from "./pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row } from "../../ui/index";
import { WritePin, TaggedSequence } from "farmbot";
import { ResourceIndex } from "../../resources/interfaces";
import { ShouldDisplay } from "../../devices/interfaces";

export function TileWritePin(p: StepParams) {
  if (p.currentStep.kind === "write_pin") {
    return <WritePinStep currentStep={p.currentStep}
      currentSequence={p.currentSequence}
      index={p.index}
      dispatch={p.dispatch}
      resources={p.resources}
      shouldDisplay={p.shouldDisplay}
      confirmStepDeletion={p.confirmStepDeletion}
      showPins={!!p.showPins} />;
  } else {
    throw new Error("Not a write_pin block.");
  }
}

export interface WritePinStepParams {
  currentStep: WritePin;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay | undefined;
  confirmStepDeletion: boolean;
  showPins: boolean;
}

export class WritePinStep extends React.Component<WritePinStepParams> {
  render() {
    const className = "write-pin-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.WRITE_PIN}
        currentSequence={this.props.currentSequence}
        currentStep={this.props.currentStep}
        dispatch={this.props.dispatch}
        index={this.props.index}
        confirmStepDeletion={this.props.confirmStepDeletion} />
      <StepContent className={className}>
        <Row>
          <PinSelect {...this.props} />
          <PinModeDropdown {...this.props} />
          <PinValueField {...this.props} />
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
