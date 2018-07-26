import * as React from "react";
import { StepButton } from "./step_buttons/index";
import { t } from "i18next";
import { scrollToBottom } from "../util";
import { Row } from "../ui/index";
import { TaggedSequence } from "../resources/tagged_resources";
import { CONFIG_DEFAULTS } from "farmbot/dist/config";

interface StepButtonProps {
  dispatch: Function;
  current: TaggedSequence | undefined;
}

export function StepButtonCluster({ dispatch, current }: StepButtonProps) {
  const ALL_THE_BUTTONS = [
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "move_absolute",
        args: {
          location: {
            kind: "coordinate",
            args: { x: 0, y: 0, z: 0 }
          },
          offset: {
            kind: "coordinate",
            args: {
              x: 0,
              y: 0,
              z: 0
            },
          },
          speed: CONFIG_DEFAULTS.speed
        }
      }}
      color="blue">
      {t("MOVE ABSOLUTE")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "move_relative",
        args: { x: 0, y: 0, z: 0, speed: CONFIG_DEFAULTS.speed }
      }}
      color="green">
      {t("MOVE RELATIVE")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "write_pin",
        args: { pin_number: 0, pin_value: 0, pin_mode: 0 }
      }}
      color="orange">
      {t("WRITE PIN")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "read_pin",
        args: {
          pin_number: 0,
          pin_mode: 0,
          label: "---"
        }
      }}
      color="yellow">
      {t("READ PIN")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "wait",
        args: { milliseconds: 0 }
      }}
      color="brown">
      {t("WAIT")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "send_message",
        args: {
          message: t("FarmBot is at position ") + "{{ x }}, {{ y }}, {{ z }}.",
          message_type: "success"
        }
      }}
      color="red">
      {t("SEND MESSAGE")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
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
    <StepButton dispatch={dispatch}
      current={current}
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
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "execute",
        args: { sequence_id: 0 }
      }}
      color="gray">
      {t("EXECUTE SEQUENCE")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "execute_script",
        args: { label: "plant-detection" }
      }}
      color="pink">
      {t("Run Farmware")}
    </StepButton>,
    <StepButton dispatch={dispatch}
      current={current}
      step={{
        kind: "take_photo",
        args: {}
      }}
      color="brown">
      {t("TAKE PHOTO")}
    </StepButton>
  ];

  return <div>
    <Row>
      <div className="step-button-cluster">
        {
          ALL_THE_BUTTONS.map(function (el, inx) {
            return <div key={inx} onClick={
              // Follows user down the page as they add sequences.
              () => { scrollToBottom("sequenceDiv"); }}>
              {el}
            </div>;
          })
        }
      </div>
    </Row>
  </div>;
}
