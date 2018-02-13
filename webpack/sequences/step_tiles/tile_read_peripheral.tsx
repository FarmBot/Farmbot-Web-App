import * as React from "react";
import { t } from "i18next";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect, DropDownItem } from "../../ui/index";
import { WritePeripheral } from "farmbot";
import { selectAllPeripherals, maybeDetermineUuid } from "../../resources/selectors";
import { editStep } from "../../api/crud";
import { isNumber } from "lodash";
import { ResourceIndex } from "../../resources/interfaces";
import { changeStep, EMPTY_READ_PIN } from "./pin_and_peripheral_support";
import { PinMode } from "./tile_read_pin";

const convertToReadPin = changeStep(EMPTY_READ_PIN);

const selectedItem = (id: number, resources: ResourceIndex) => {
  const uuid = maybeDetermineUuid(resources, "Peripheral", id) || "_";
  const item = resources.references[uuid];
  if (item && item.kind === "Peripheral") {
    return { label: item.body.label, value: item.body.id || 0 };
  }
};

export function TileReadPeripheral(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "read-pin-step";
  const payl = convertToReadPin(currentStep, currentSequence, index);
  const peripherals: DropDownItem[] = selectAllPeripherals(props.resources)
    .map(x => {
      const label = x.body.label;
      const value = x.body.id || 0;
      return { label, value };
    })
    .filter(x => x.value);
  if (currentStep.kind !== "read_peripheral") {
    throw new Error("Expected `read_peripheral`");
  }
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.READ_PIN}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index} />
    <StepContent className={className}>
      <Row>
        <Col xs={12} md={6}>
          <label>{t("Peripheral")}</label>
          <FBSelect
            allowEmpty={false}
            list={peripherals}
            placeholder="Select a peripheral..."
            onChange={(selection) => {
              dispatch(editStep({
                sequence: currentSequence,
                step: currentStep,
                index: index,
                executor: (step: WritePeripheral) => {
                  if (isNumber(selection.value)) {
                    step.args.peripheral_id = selection.value;
                  } else {
                    throw new Error("selection.value must be numeric");
                  }
                }
              }));
            }}
            selectedItem={selectedItem(currentStep.args.peripheral_id, props.resources)} />
        </Col>
        <PinMode {...props} />
      </Row>
      <Row>
        <Col xs={6} md={6}>
          <label>
            <a onClick={() => dispatch(payl)}>
              {t("Enter peripheral data manually")}
            </a>
          </label>
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
