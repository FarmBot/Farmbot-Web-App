import React from "react";
import { StepButton } from "./step_buttons";
import { scrollToBottom, urlFriendly } from "../util";
import { Col, Row } from "../ui";
import { TaggedSequence } from "farmbot";
import { Feature } from "../devices/interfaces";
import { FarmwareData, MessageType } from "./interfaces";
import { t } from "../i18next_wrapper";
import { NOTHING_SELECTED } from "./locals_list/handle_select";
import { push } from "../history";
import { FarmwareName } from "./step_tiles/tile_execute_script";
import { variableList } from "./locals_list/variable_support";
import { ResourceIndex } from "../resources/interfaces";
import { shouldDisplayFeature } from "../devices/should_display";
import { Path } from "../internal_urls";

export interface StepButtonProps {
  dispatch: Function;
  current: TaggedSequence | undefined;
  stepIndex: number | undefined;
  farmwareData: FarmwareData;
  sequences: TaggedSequence[];
  resources: ResourceIndex;
}

export function StepButtonCluster(props: StepButtonProps) {
  const { dispatch, current, stepIndex } = props;
  const commonStepProps = { dispatch, current, index: stepIndex };
  const ALL_THE_BUTTONS = [
    <StepButton {...commonStepProps}
      step={{ kind: "move", args: {} }}
      color="blue">
      {t("MOVE")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{
        kind: "write_pin",
        args: { pin_number: NOTHING_SELECTED, pin_value: 0, pin_mode: 0 }
      }}
      color="orange">
      {t("CONTROL PERIPHERAL")}
    </StepButton>,
    ...(shouldDisplayFeature(Feature.toggle_peripheral)
      ? [<StepButton {...commonStepProps}
        step={{
          kind: "toggle_pin",
          args: { pin_number: NOTHING_SELECTED }
        }}
        color="orange">
        {t("TOGGLE PERIPHERAL")}
      </StepButton>]
      : []),
    <StepButton {...commonStepProps}
      step={{
        kind: "read_pin",
        args: {
          pin_number: NOTHING_SELECTED,
          pin_mode: 0,
          label: "---"
        }
      }}
      color="yellow">
      {t("READ SENSOR")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{
        kind: "set_servo_angle",
        args: {
          pin_number: 4,
          pin_value: 90
        }
      }}
      color="blue">
      {t("CONTROL SERVO")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{
        kind: "wait",
        args: { milliseconds: 0 }
      }}
      color="brown">
      {t("WAIT")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{
        kind: "send_message",
        args: {
          message: t("FarmBot is at position ") + "{{ x }}, {{ y }}, {{ z }}.",
          message_type: MessageType.success
        }
      }}
      color="brown">
      {t("SEND MESSAGE")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{ kind: "reboot", args: { package: "farmbot_os" } }}
      color="brown">
      {t("REBOOT")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{ kind: "power_off", args: {} }}
      color="brown">
      {t("SHUTDOWN")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{ kind: "emergency_lock", args: {} }}
      color="red">
      {t("E-STOP")}
    </StepButton>,
    <StepButton{...commonStepProps}
      step={{
        kind: "find_home",
        args: {
          axis: "all",
          speed: 100
        }
      }}
      color="blue">
      {t("Find Home")}
    </StepButton>,
    <StepButton{...commonStepProps}
      step={{
        kind: "zero",
        args: { axis: "all" }
      }}
      color="blue">
      {t("Set Home")}
    </StepButton>,
    <StepButton{...commonStepProps}
      step={{
        kind: "calibrate",
        args: { axis: "all" }
      }}
      color="blue">
      {t("Find axis length")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{
        kind: "_if",
        args: {
          lhs: "x",
          op: "is",
          rhs: 0,
          _then: { kind: "nothing", args: {} },
          _else: { kind: "nothing", args: {} }
        }
      }}
      color="purple">
      {t("IF STATEMENT")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{
        kind: "execute",
        args: { sequence_id: 0 }
      }}
      color="gray">
      {t("EXECUTE SEQUENCE")}
    </StepButton>,
    <StepButton {...commonStepProps}
      step={{
        kind: "execute_script",
        args: { label: FarmwareName.PlantDetection },
        comment: t("DETECT WEEDS")
      }}
      color="pink">
      {t("Detect Weeds")}
    </StepButton>,
    ...(props.farmwareData.farmwareNames.includes(FarmwareName.MeasureSoilHeight)
      ? [<StepButton {...commonStepProps}
        step={{
          kind: "execute_script",
          args: { label: FarmwareName.MeasureSoilHeight },
        }}
        color="pink">
        {t("Measure soil height")}
      </StepButton>]
      : []),
    <StepButton
      {...commonStepProps}
      color="brown"
      step={{ kind: "take_photo", args: {} }}>
      {t("TAKE PHOTO")}
    </StepButton>,
    <StepButton
      {...commonStepProps}
      step={{
        kind: "assertion",
        args: {
          lua: "return 2 + 2 == 4",
          _then: { kind: "nothing", args: {} },
          assertion_type: "abort_recover",
        }
      }}
      color="purple">
      {t("ASSERTION")}
    </StepButton>,
    <StepButton
      {...commonStepProps}
      step={{ kind: "lua", args: { lua: "" } }}
      color="purple">
      {t("LUA")}
    </StepButton>,
    <StepButton
      {...commonStepProps}
      step={{
        kind: "update_resource",
        args: { resource: NOTHING_SELECTED },
        body: [],
      }}
      color="brown">
      {t("Mark As...")}
    </StepButton>,
  ];

  const sequenceUrlName = urlFriendly(props.current?.body.name || "");
  const click = () => {
    scrollToBottom("sequenceDiv");
    Path.inDesigner() && push(Path.sequences(sequenceUrlName));
  };
  const pinnedSequences = props.sequences.filter(s => s.body.pinned);
  return <Row>
    <div className="step-button-cluster">
      {ALL_THE_BUTTONS.map((stepButton, inx) =>
        <div className={"step-button"} key={inx} onClick={click}>
          {stepButton}
        </div>)}
      {pinnedSequences.length > 0 &&
        <Col xs={12}><label>{t("pinned sequences")}</label></Col>}
      <div className={"pinned-sequences"}>
        {props.sequences.filter(s => s.body.pinned)
          .map(s => s.body.id &&
            <div className={"step-button"} key={s.uuid} onClick={click}>
              <StepButton {...commonStepProps}
                step={{
                  kind: "execute",
                  args: { sequence_id: s.body.id },
                  body: variableList(props.resources.sequenceMetas[s.uuid])
                }}
                color={s.body.color}>
                {s.body.name}
              </StepButton>
            </div>)}
      </div>
    </div>
  </Row>;
}
