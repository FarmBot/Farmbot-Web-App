import * as React from "react";
import { t } from "i18next";
import * as _ from "lodash";
import {
  Widget, WidgetBody, WidgetHeader,
  Row, Col,
  BlurableInput,
  DropDownItem
} from "../../ui/index";
import { ToolTips } from "../../constants";
import { BotState, ShouldDisplay, Feature } from "../interfaces";
import { registerGpioPin, unregisterGpioPin } from "../actions";
import { findSequenceById, selectAllPinBindings } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { MustBeOnline } from "../must_be_online";
import { Popover, Position } from "@blueprintjs/core";
import { RpiGpioDiagram, gpio } from "./rpi_gpio_diagram";
import { error } from "farmbot-toastr";
import { NetworkState } from "../../connectivity/interfaces";
import { SequenceSelectBox } from "../../sequences/sequence_select_box";
import { initSave, destroy } from "../../api/crud";
import { TaggedPinBinding, SpecialStatus } from "../../resources/tagged_resources";

export interface PinBindingsProps {
  bot: BotState;
  dispatch: Function;
  botToMqttStatus: NetworkState;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
}

export interface PinBindingsState {
  isEditing: boolean;
  pinNumberInput: number | undefined;
  sequenceIdInput: number | undefined;
}

enum ColumnWidth {
  pin = 4,
  sequence = 7,
  button = 1
}

export class PinBindings
  extends React.Component<PinBindingsProps, PinBindingsState> {
  constructor(props: PinBindingsProps) {
    super(props);
    this.state = {
      isEditing: false,
      pinNumberInput: undefined,
      sequenceIdInput: undefined
    };
  }

  get pinBindings(): {
    pin_number: number, sequence_id: number, uuid?: string
  }[] {
    if (this.props.shouldDisplay(Feature.api_pin_bindings)) {
      return selectAllPinBindings(this.props.resources)
        .map(x => {
          return {
            pin_number: x.body.pin_num,
            sequence_id: x.body.sequence_id,
            uuid: x.uuid
          };
        });
    } else {
      const { gpio_registry } = this.props.bot.hardware;
      return Object.entries(gpio_registry || {})
        .map(([pin_number, sequence_id]) => {
          return {
            pin_number: parseInt(pin_number),
            sequence_id: parseInt(sequence_id || "")
          };
        });
    }
  }

  changeSelection = (input: DropDownItem) => {
    this.setState({ sequenceIdInput: parseInt(input.value as string) });
  }

  setSelectedPin = (pin: number | undefined) => {
    if (!_.includes(this.boundPins, pin)) {
      if (_.includes(_.flattenDeep(gpio), pin)) {
        this.setState({ pinNumberInput: pin });
      } else {
        error("Invalid Raspberry Pi GPIO pin number.");
      }
    } else {
      error("Raspberry Pi GPIO pin already bound.");
    }
  }

  taggedPinBinding =
    (pin_num: number, sequence_id: number): TaggedPinBinding => {
      return {
        uuid: "WILL_BE_CHANGED_BY_REDUCER",
        specialStatus: SpecialStatus.SAVED,
        kind: "PinBinding",
        body: { pin_num, sequence_id }
      };
    }

  bindPin = () => {
    const { pinNumberInput, sequenceIdInput } = this.state;
    if (pinNumberInput && sequenceIdInput) {
      if (this.props.shouldDisplay(Feature.api_pin_bindings)) {
        this.props.dispatch(initSave(
          this.taggedPinBinding(pinNumberInput, sequenceIdInput)));
      } else {
        this.props.dispatch(registerGpioPin({
          pin_number: pinNumberInput,
          sequence_id: sequenceIdInput
        }));
      }
      this.setState({
        pinNumberInput: undefined,
        sequenceIdInput: undefined
      });
    }
  }

  deleteBinding = (pin: number, uuid?: string) => {
    if (this.props.shouldDisplay(Feature.api_pin_bindings)) {
      this.props.dispatch(destroy(uuid || ""));
    } else {
      this.props.dispatch(unregisterGpioPin(pin));
    }
  }

  get boundPins(): number[] | undefined {
    return this.pinBindings.map(x => x.pin_number);
  }

  currentBindingsList = () => {
    const { resources } = this.props;
    return <div className={"bindings-list"}>
      {this.pinBindings
        .map(x => {
          const { pin_number, sequence_id } = x;
          return <Row key={`pin_${pin_number}_binding`}>
            <Col xs={ColumnWidth.pin}>
              {`Pi GPIO ${pin_number}`}
            </Col>
            <Col xs={ColumnWidth.sequence}>
              {sequence_id ? findSequenceById(
                resources, sequence_id).body.name : ""}
            </Col>
            <Col xs={ColumnWidth.button}>
              <button
                className="fb-button red"
                onClick={() => this.deleteBinding(pin_number, x.uuid)}>
                <i className="fa fa-minus" />
              </button>
            </Col>
          </Row>;
        })}
    </div>;
  }

  pinBindingInputGroup = () => {
    const { pinNumberInput, sequenceIdInput } = this.state;
    return <Row>
      <Col xs={ColumnWidth.pin}>
        <Row>
          <Col xs={1}>
            <Popover position={Position.TOP}>
              <i className="fa fa-th-large" />
              <RpiGpioDiagram
                boundPins={this.boundPins}
                setSelectedPin={this.setSelectedPin}
                selectedPin={this.state.pinNumberInput} />
            </Popover>
          </Col>
          <Col xs={9}>
            <BlurableInput
              onCommit={(e) =>
                this.setSelectedPin(parseInt(e.currentTarget.value))}
              name="pin_number"
              value={_.isNumber(pinNumberInput) ? pinNumberInput : ""}
              type="number" />
          </Col>
        </Row>
      </Col>
      <Col xs={ColumnWidth.sequence}>
        <SequenceSelectBox
          key={sequenceIdInput}
          onChange={this.changeSelection}
          resources={this.props.resources}
          sequenceId={sequenceIdInput} />
      </Col>
      <Col xs={ColumnWidth.button}>
        <button
          className="fb-button green"
          type="button"
          onClick={() => { this.bindPin(); }} >
          {t("BIND")}
        </button>
      </Col>
    </Row>;
  }

  render() {
    return <Widget className="pin-bindings-widget">
      <WidgetHeader
        title={t("Pin Bindings")}
        helpText={ToolTips.PIN_BINDINGS} />
      <WidgetBody>
        <MustBeOnline
          syncStatus={this.props.bot.hardware.informational_settings.sync_status}
          networkState={this.props.botToMqttStatus}
          lockOpen={this.props.shouldDisplay(Feature.api_pin_bindings)
            || process.env.NODE_ENV !== "production"}>
          <Row>
            <Col xs={ColumnWidth.pin}>
              <label>
                {t("Pin Number")}
              </label>
            </Col>
            <Col xs={ColumnWidth.sequence}>
              <label>
                {t("Sequence")}
              </label>
            </Col>
          </Row>
          <this.currentBindingsList />
          <this.pinBindingInputGroup />
        </MustBeOnline>
      </WidgetBody>
    </Widget>;
  }
}
