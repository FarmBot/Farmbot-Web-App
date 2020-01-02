import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import {
  setPinValue, currentValueSelection, PIN_VALUES
} from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  celery2DropDown,
  setArgsDotPinNumber,
  pinsAsDropDownsWritePin
} from "./pin_and_peripheral_support";
import { t } from "../../i18next_wrapper";
import { PinMode } from "./tile_read_pin";
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

interface PinSelectProps extends StepParams {
  width?: number;
}

export const PinSelect = (props: PinSelectProps): JSX.Element => {
  const step = props.currentStep;
  if (
    step.kind === "write_pin" ||
    step.kind === "toggle_pin" ||
    step.kind === "read_pin") {
    const { currentSequence, resources, showPins } = props;
    const { pin_number } = step.args;
    const width = props.width || 6;

    return <Col xs={width} md={width}>
      <label>{t("Peripheral")}</label>
      <FBSelect
        key={JSON.stringify(currentSequence)}
        selectedItem={celery2DropDown(pin_number, resources)}
        customNullLabel={t("Select a peripheral")}
        onChange={setArgsDotPinNumber(props)}
        list={pinsAsDropDownsWritePin(resources, !!showPins)} />
    </Col>;
  }

  throw new Error("Can't render " + step ? step.kind : "NULL");
};

export class WritePinStep extends React.Component<WritePinStepParams> {
  PinValueField = (): JSX.Element => {
    const { dispatch, currentStep, index, currentSequence } = this.props;
    return (!(currentStep.args.pin_mode === 0) || currentStep.args.pin_value > 1)
      /** Analog pin mode: display number input for pin value. */
      ? <StepInputBox dispatch={dispatch}
        step={currentStep}
        sequence={currentSequence}
        index={index}
        field="pin_value" />
      /** Digital mode: replace pin value input with an ON/OFF dropdown. */
      : <FBSelect
        key={JSON.stringify(currentSequence)}
        onChange={x => setPinValue(x, this.props)}
        selectedItem={currentValueSelection(currentStep)}
        list={PIN_VALUES()} />;
  }

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
          <PinMode {...this.props} />
          <Col xs={6} md={3}>
            <label>{t("set to")}</label>
            <this.PinValueField />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
