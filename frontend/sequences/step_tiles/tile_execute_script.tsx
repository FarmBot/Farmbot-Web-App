import * as React from "react";
import { StepParams } from "../interfaces";

import { ToolTips } from "../../constants";
import { StepInputBox } from "../inputs/step_input_box";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect, DropDownItem } from "../../ui/index";
import { editStep } from "../../api/crud";
import { ExecuteScript, FarmwareConfig } from "farmbot";
import { FarmwareInputs, farmwareList } from "./tile_execute_script_support";
import { t } from "../../i18next_wrapper";

export function TileExecuteScript(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence, farmwareInfo } = props;
  if (currentStep.kind === "execute_script") {

    const farmwareName = currentStep.args.label;

    /** Selected Farmware is installed on connected bot. */
    const isInstalled = (name: string): boolean => {
      return !!(farmwareInfo && farmwareInfo.farmwareNames.includes(name));
    };

    const selectedFarmwareDDI = (name: string): DropDownItem => {
      if (isInstalled(name)) {
        return name === "plant-detection"
          ? { value: name, label: t("Weed Detector") }
          : { value: name, label: name };
      }
      return { label: "Manual Input", value: "" };
    };

    /** dispatch editStep for current ExecuteScript step */
    const updateStep = (executor: (stepCopy: ExecuteScript) => void) => {
      dispatch(editStep({
        sequence: currentSequence,
        step: currentStep,
        index: index,
        executor
      }));
    };

    /** Change step Farmware name. */
    const updateStepFarmwareSelection = (item: DropDownItem) => {
      updateStep((step: ExecuteScript) => {
        if (step.body && (step.args.label !== "" + item.value)) {
          // Clear step body when switching to a different Farmware
          delete step.body;
        }
        step.args.label = "" + item.value;
      });
    };

    /** Configs (inputs) from Farmware manifest for <FarmwareInputs />. */
    const currentFarmwareConfigDefaults = (fwName: string): FarmwareConfig[] => {
      return farmwareInfo && farmwareInfo.farmwareConfigs[fwName]
        ? farmwareInfo.farmwareConfigs[fwName]
        : [];
    };

    const className = "execute-script-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.EXECUTE_SCRIPT}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index}
        confirmStepDeletion={props.confirmStepDeletion} />
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <label>{t("Package Name")}</label>
            <FBSelect
              key={JSON.stringify(props.currentSequence)}
              list={farmwareList(farmwareInfo)}
              selectedItem={selectedFarmwareDDI(farmwareName)}
              onChange={updateStepFarmwareSelection}
              allowEmpty={true}
              customNullLabel={"Manual Input"} />
            {!isInstalled(farmwareName) &&
              <div className="farmware-name-manual-input">
                <label>{t("Manual input")}</label>
                <StepInputBox dispatch={dispatch}
                  index={index}
                  step={currentStep}
                  sequence={currentSequence}
                  field="label" />
              </div>}
            <FarmwareInputs
              farmwareName={farmwareName}
              farmwareInstalled={isInstalled(farmwareName)}
              defaultConfigs={currentFarmwareConfigDefaults(farmwareName)}
              currentStep={currentStep}
              updateStep={updateStep} />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  } else {
    return <p> ERROR </p>;
  }
}
