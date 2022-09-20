import React from "react";
import { t } from "../i18next_wrapper";
import { StepButton, stepClick } from "./step_buttons";
import { equals, scrollToBottom } from "../util";
import { Col, Row } from "../ui";
import { Color, SequenceBodyItem, TaggedSequence } from "farmbot";
import { FarmwareData, MessageType } from "./interfaces";
import { FarmwareName } from "./step_tiles/tile_execute_script";
import { variableList } from "./locals_list/variable_support";
import { ResourceIndex } from "../resources/interfaces";
import { SearchField } from "../ui/search_field";
import { Path } from "../internal_urls";

/**
 * This is specifically an invalid field value to force the
 * user to make a valid selection to successfully save the step.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NOTHING_SELECTED: any = { kind: "nothing", args: {} };

const COMMANDS = (farmwareData: FarmwareData | undefined): CommandItem[] => [
  {
    title: t("Move"),
    color: "blue",
    step: { kind: "move", args: {} },
  },
  {
    title: t("Control peripheral"),
    color: "orange",
    step: {
      kind: "write_pin",
      args: { pin_number: NOTHING_SELECTED, pin_value: 0, pin_mode: 0 }
    },
  },
  {
    title: t("Toggle peripheral"),
    color: "orange",
    step: {
      kind: "toggle_pin",
      args: { pin_number: NOTHING_SELECTED }
    },
  },
  {
    title: t("Read sensor"),
    color: "yellow",
    step: {
      kind: "read_pin",
      args: {
        pin_number: NOTHING_SELECTED,
        pin_mode: 0,
        label: "---"
      }
    },
  },
  {
    title: t("Control servo"),
    color: "blue",
    step: {
      kind: "set_servo_angle",
      args: {
        pin_number: 4,
        pin_value: 90
      }
    },
  },
  {
    title: t("Wait"),
    color: "brown",
    step: { kind: "wait", args: { milliseconds: 0 } },
  },
  {
    title: t("Send message"),
    color: "brown",
    step: {
      kind: "send_message",
      args: {
        message: t("FarmBot is at position ") + "{{ x }}, {{ y }}, {{ z }}.",
        message_type: MessageType.success
      }
    },
  },
  {
    title: t("Reboot"),
    color: "brown",
    step: { kind: "reboot", args: { package: "farmbot_os" } },
  },
  {
    title: t("Shutdown"),
    color: "brown",
    step: { kind: "power_off", args: {} },
  },
  {
    title: t("E-STOP"),
    color: "red",
    step: { kind: "emergency_lock", args: {} },
  },
  {
    title: t("Find home"),
    color: "blue",
    step: { kind: "find_home", args: { axis: "all", speed: 100 } },
  },
  {
    title: t("Set home"),
    color: "blue",
    step: { kind: "zero", args: { axis: "all" } },
  },
  {
    title: t("Find axis length"),
    color: "blue",
    step: { kind: "calibrate", args: { axis: "all" } },
  },
  {
    title: t("If statement"),
    color: "purple",
    step: {
      kind: "_if",
      args: {
        lhs: "x",
        op: "is",
        rhs: 0,
        _then: { kind: "nothing", args: {} },
        _else: { kind: "nothing", args: {} }
      }
    },
  },
  ...(!Path.inDesigner()
    ? [{
      title: t("Execute sequence"),
      color: "gray",
      step: {
        kind: "execute",
        args: { sequence_id: 0 }
      },
    } as CommandItem]
    : []),
  {
    title: t("Detect weeds"),
    color: "pink",
    step: {
      kind: "execute_script",
      args: { label: FarmwareName.PlantDetection },
      comment: t("DETECT WEEDS")
    },
  },
  ...(farmwareData?.farmwareNames.includes(FarmwareName.MeasureSoilHeight)
    ? [{
      title: t("Measure soil height"),
      color: "pink",
      step: {
        kind: "execute_script",
        args: { label: FarmwareName.MeasureSoilHeight },
      },
    } as CommandItem]
    : []),
  {
    title: t("Take photo"),
    color: "brown",
    step: { kind: "take_photo", args: {} },
  },
  {
    title: t("Assertion"),
    color: "purple",
    step: {
      kind: "assertion",
      args: {
        lua: "return 2 + 2 == 4",
        _then: { kind: "nothing", args: {} },
        assertion_type: "abort_recover",
      }
    },
  },
  {
    title: t("Lua"),
    color: "purple",
    step: { kind: "lua", args: { lua: "" } },
  },
  {
    title: t("Mark as..."),
    color: "brown",
    step: {
      kind: "update_resource",
      args: { resource: NOTHING_SELECTED },
      body: [],
    },
  },
];

export interface StepButtonProps {
  dispatch: Function;
  current: TaggedSequence | undefined;
  stepIndex: number | undefined;
  farmwareData: FarmwareData | undefined;
  sequences?: TaggedSequence[];
  resources: ResourceIndex;
  close(): void;
}

interface CommandItem {
  title: string;
  color: Color | "brown";
  step: SequenceBodyItem;
}

interface StepButtonClusterState {
  searchTerm: string;
}

export class StepButtonCluster
  extends React.Component<StepButtonProps, StepButtonClusterState> {
  state: StepButtonClusterState = { searchTerm: "" };

  shouldComponentUpdate(
    nextProps: StepButtonProps,
    nextState: StepButtonClusterState,
  ) {
    const propsChanged = !equals(this.props, nextProps);
    const stateChanged = !equals(this.state, nextState);
    return propsChanged || stateChanged;
  }

  setSearchTerm = (searchTerm: string) => this.setState({ searchTerm });

  render() {
    const { dispatch, current, stepIndex, resources } = this.props;
    const commonStepProps = { dispatch, current, index: stepIndex };
    const click = () => {
      scrollToBottom("sequenceDiv");
      this.props.close();
    };
    const { searchTerm } = this.state;
    const commands = COMMANDS(this.props.farmwareData)
      .filter(x => x.title.toLowerCase()
        .includes(searchTerm.toLowerCase()));
    const sequences = (this.props.sequences || [])
      .filter(s => Path.inDesigner() || s.body.pinned)
      .filter(x => x.body.name.toLowerCase()
        .includes(searchTerm.toLowerCase()));
    const first = commands[0]?.step || (sequences[0] && {
      kind: "execute",
      args: { sequence_id: sequences[0].body.id },
      body: variableList(resources.sequenceMetas[sequences[0].uuid])
    });
    const Cluster = () => <div className={[
      "step-button-cluster",
      Path.inDesigner() ? "designer-cluster" : "",
    ].join(" ")}>
      <SearchField searchTerm={searchTerm}
        placeholder={t("Search commands and sequences...")}
        customLeftIcon={<i />}
        autoFocus={Path.inDesigner()}
        onEnter={() => {
          if (first) {
            click();
            stepClick(dispatch, first, current, stepIndex)();
          }
        }}
        onChange={this.setSearchTerm} />
      <div className={"commands"}>
        {commands.map((stepButton, inx) =>
          <div className={[
            "step-button",
            inx == 0 ? "highlight" : "",
          ].join(" ")} key={inx} onClick={click}>
            <StepButton {...commonStepProps}
              step={stepButton.step}
              label={stepButton.title}
              color={stepButton.color} />
          </div>)}
        {!Path.inDesigner() && sequences.length > 0 &&
          <Col xs={12}><label>{t("pinned sequences")}</label></Col>}
        <div className={"pinned-sequences"}>
          {sequences.map((s, inx) => s.body.id &&
            <div className={[
              "step-button",
              commands.length == 0 && inx == 0 ? "highlight" : "",
            ].join(" ")} key={s.uuid} onClick={click}>
              <StepButton {...commonStepProps}
                step={{
                  kind: "execute",
                  args: { sequence_id: s.body.id },
                  body: variableList(resources.sequenceMetas[s.uuid])
                }}
                label={s.body.name}
                color={s.body.color} />
            </div>)}
        </div>
      </div>
    </div>;
    return Path.inDesigner() ? <Cluster /> : <Row><Cluster /></Row>;
  }
}
