import React from "react";
import { StepParams, FarmwareData } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import { StepInputBox } from "../inputs/step_input_box";
import { StepWrapper, StepWarning } from "../step_ui";
import { Row, FBSelect, DropDownItem } from "../../ui";
import { editStep } from "../../api/crud";
import { ExecuteScript, FarmwareConfig } from "farmbot";
import { FarmwareInputs, farmwareList } from "./tile_execute_script_support";
import { t } from "../../i18next_wrapper";
import { Link } from "../../link";
import { Path } from "../../internal_urls";

export enum FarmwareName {
  PlantDetection = "plant-detection",
  MeasureSoilHeight = "Measure Soil Height",
}

export const TileExecuteScript = (props: StepParams<ExecuteScript>) => {
  const farmwareName = props.currentStep.args.label;
  return <StepWrapper {...props}
    className={"execute-script-step"}
    helpText={getHelpText(farmwareName)}
    warning={<CameraRequiredStepWarnings farmwareName={farmwareName}
      farmwareData={props.farmwareData} />}>
    <Row>
      <FarmwareStepContents {...props} />
    </Row>
  </StepWrapper>;
};

const getHelpText = (farmwareName: string) => {
  switch (farmwareName) {
    case FarmwareName.PlantDetection: return ToolTips.DETECT_WEEDS;
    case FarmwareName.MeasureSoilHeight: return ToolTips.MEASURE_SOIL_HEIGHT;
    default: return ToolTips.EXECUTE_SCRIPT;
  }
};

export const DefaultFarmwareStep = (props: StepParams<ExecuteScript>) => {
  const {
    dispatch, currentStep, index, currentSequence, farmwareData,
  } = props;

  const farmwareName = currentStep.args.label;

  /** Selected Farmware is installed on connected bot. */
  const isInstalled = (n: string): boolean => {
    return !!(farmwareData && farmwareData.farmwareNames.includes(n));
  };

  const selectedFarmwareDDI = (n: string): DropDownItem => {
    if (isInstalled(n)) { return { value: n, label: n }; }
    return { label: t("Manual Input"), value: "" };
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
    return farmwareData?.farmwareConfigs[fwName]
      ? farmwareData.farmwareConfigs[fwName]
      : [];
  };

  return <div>
    <label>{t("Package Name")}</label>
    <FBSelect
      key={JSON.stringify(currentSequence)}
      list={farmwareList(farmwareData)}
      selectedItem={selectedFarmwareDDI(farmwareName)}
      onChange={updateStepFarmwareSelection}
      allowEmpty={true}
      customNullLabel={t("Manual Input")} />
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
  </div>;
};

const FarmwareStepContents = (props: StepParams<ExecuteScript>) => {
  switch (props.currentStep.args.label) {
    case FarmwareName.PlantDetection: return <DetectWeedsStep />;
    case FarmwareName.MeasureSoilHeight: return <MeasureSoilHeightStep />;
    default: return <DefaultFarmwareStep {...props} />;
  }
};

const DetectWeedsStep = () =>
  <p>
    {`${t("Results are viewable from the")} `}
    <Link to={Path.photos()}>
      {t("photos panel")}
    </Link>.
  </p>;

const MeasureSoilHeightStep = () =>
  <p>
    {`${t("Results are viewable in the")} `}
    <Link to={Path.points()}>
      {t("points panel")}
    </Link>.
  </p>;

interface CameraRequiredStepWarningsProps {
  farmwareName: string;
  farmwareData: FarmwareData | undefined;
}

const CAMERA_REQUIRED: string[] = [
  FarmwareName.PlantDetection,
  FarmwareName.MeasureSoilHeight,
];
const CALIBRATION_REQUIRED: string[] = [FarmwareName.PlantDetection];

const CameraRequiredStepWarnings = (props: CameraRequiredStepWarningsProps) => {
  if (props.farmwareData) {
    if (props.farmwareData.cameraDisabled
      && CAMERA_REQUIRED.includes(props.farmwareName)) {
      return <StepWarning
        titleBase={t(Content.NO_CAMERA_SELECTED)}
        warning={t(ToolTips.SELECT_A_CAMERA)} />;
    }
    if (!props.farmwareData.cameraCalibrated
      && CALIBRATION_REQUIRED.includes(props.farmwareName)) {
      return <StepWarning
        titleBase={t(Content.CAMERA_NOT_CALIBRATED)}
        warning={t(ToolTips.CALIBRATION_REQUIRED)} />;
    }
  }
  return <div className={"no-warnings"} />;
};
