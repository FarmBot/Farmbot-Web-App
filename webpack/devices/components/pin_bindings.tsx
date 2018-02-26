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
import { BotState } from "../interfaces";
import { registerGpioPin, unregisterGpioPin } from "../actions";
import { findSequenceById } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { MustBeOnline } from "../must_be_online";
import { Popover, Position } from "@blueprintjs/core";
import { RpiGpioDiagram, gpio } from "./rpi_gpio_diagram";
import { error } from "farmbot-toastr";
import { NetworkState } from "../../connectivity/interfaces";
import { SequenceSelectBox } from "../../sequences/sequence_select_box";

export interface PinBindingsProps {
  bot: BotState;
  dispatch: Function;
  botToMqttStatus: NetworkState;
  resources: ResourceIndex;
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

  bindPin = () => {
    const { pinNumberInput, sequenceIdInput } = this.state;
    if (pinNumberInput && sequenceIdInput) {
      this.props.dispatch(registerGpioPin({
        pin_number: pinNumberInput,
        sequence_id: sequenceIdInput
      }));
      this.setState({
        pinNumberInput: undefined,
        sequenceIdInput: undefined
      });
    }
  }

  get boundPins(): number[] | undefined {
    const { gpio_registry } = this.props.bot.hardware;
    return gpio_registry && Object.keys(gpio_registry).map(x => parseInt(x));
  }

  currentBindingsList = () => {
    const { bot, dispatch, resources } = this.props;
    const { gpio_registry } = bot.hardware;
    return <div className={"bindings-list"}>
      {gpio_registry &&
        Object.entries(gpio_registry)
          .map(([pin_number, sequence_id]) => {
            return <Row key={`pin_${pin_number}_binding`}>
              <Col xs={ColumnWidth.pin}>
                {`Pi GPIO ${pin_number}`}
              </Col>
              <Col xs={ColumnWidth.sequence}>
                {sequence_id ? findSequenceById(
                  resources, parseInt(sequence_id)).body.name : ""}
              </Col>
              <Col xs={ColumnWidth.button}>
                <button
                  className="fb-button red"
                  onClick={() => {
                    dispatch(unregisterGpioPin(parseInt(pin_number)));
                  }}>
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
          lockOpen={process.env.NODE_ENV !== "production"}>
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
