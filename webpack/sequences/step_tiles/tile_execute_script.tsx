import * as React from "react";
import { StepParams } from "../interfaces";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { StepInputBox } from "../inputs/step_input_box";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect, DropDownItem } from "../../ui/index";
import { assign } from "lodash";
import { defensiveClone } from "../../util";
import { overwrite } from "../../api/crud";

const MANUAL_INPUT = { label: "Manual Input", value: "" };

export function TileExecuteScript({
  dispatch, currentStep, index, currentSequence, farmwareInfo }: StepParams) {
  if (currentStep.kind === "execute_script") {

    const farmwareList = () => {
      if (farmwareInfo) {
        const {
          farmwareNames, showFirstPartyFarmware, firstPartyFarmwareNames
        } = farmwareInfo;
        return farmwareNames
          .filter(x => (firstPartyFarmwareNames && !showFirstPartyFarmware)
            ? !firstPartyFarmwareNames.includes(x) : x)
          .map(name => ({ value: name, label: name }));
      }
      return [];
    };

    const selectedFarmware = () => {
      const farmware = currentStep.args.label;
      if (farmwareInfo && farmwareInfo.farmwareNames.includes(farmware)) {
        return { value: farmware, label: farmware };
      }
      return MANUAL_INPUT;
    };

    const updateStep = (item: DropDownItem) => {
      const stepCopy = defensiveClone(currentStep);
      const seqCopy = defensiveClone(currentSequence).body;
      seqCopy.body = seqCopy.body || [];
      assign(stepCopy.args, { label: item.value });
      seqCopy.body[index] = stepCopy;
      dispatch(overwrite(currentSequence, seqCopy));
    };

    const className = "execute-script-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.EXECUTE_SCRIPT}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index} />
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <label>{t("Package Name")}</label>
            <FBSelect
              key={selectedFarmware().label}
              list={farmwareList()}
              selectedItem={selectedFarmware()}
              onChange={updateStep}
              allowEmpty={true}
              customNullLabel={"Manual Input"} />
            {selectedFarmware() === MANUAL_INPUT &&
              <div>
                <label>{t("Manual input")}</label>
                <StepInputBox dispatch={dispatch}
                  index={index}
                  step={currentStep}
                  sequence={currentSequence}
                  field="label" />
              </div>}
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  } else {
    return <p> ERROR </p>;
  }
}
