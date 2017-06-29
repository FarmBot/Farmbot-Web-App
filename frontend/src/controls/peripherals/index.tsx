import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { PeripheralList } from "./peripheral_list";
import { PeripheralForm } from "./peripheral_form";
import { Widget, WidgetBody, WidgetHeader, SaveBtn } from "../../ui";
import { PeripheralsProps } from "../../devices/interfaces";
import { PeripheralState } from "./interfaces";
import { TaggedPeripheral } from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { ToolTips } from "../../constants";

export class Peripherals extends React.Component<PeripheralsProps, PeripheralState> {
  constructor() {
    super();
    this.state = { isEditing: false };
  }

  toggle = () => {
    this.setState({ isEditing: !this.state.isEditing });
  }

  maybeSave = () => {
    let { peripherals } = this.props;
    let pinNums = peripherals.map(x => x.body.pin);
    let positivePins = pinNums.filter(x => x && x > 0);
    let smallPins = pinNums.filter(x => x && x < 1000);
    // I hate adding client side validation, but this is a wonky endpoint - RC.
    let allAreUniq = _.uniq(pinNums).length === pinNums.length;
    let allArePositive = positivePins.length === pinNums.length;
    let allAreSmall = smallPins.length === pinNums.length;
    if (allAreUniq && allArePositive) {
      if (allAreSmall) {
        this.props.dispatch(saveAll(this.props.peripherals, this.toggle));
      } else {
        error("Pin numbers must be less than 1000.");
      }
    } else {
      error("Pin numbers are required and must be positive and unique.");
    }
  }

  showPins = () => {
    let { peripherals, dispatch, bot } = this.props;

    let pins = bot.hardware.pins;
    if (this.state.isEditing) {
      return <PeripheralForm peripherals={peripherals}
        dispatch={dispatch} />
    } else {
      return <PeripheralList peripherals={peripherals}
        dispatch={dispatch}
        pins={pins} />
    }
  }

  emptyPeripheral = (): TaggedPeripheral => {
    return {
      uuid: "WILL_BE_CHANGED_BY_REDUCER",
      kind: "peripherals",
      body: { pin: 0, label: "New Peripheral" }
    }
  }

  render() {
    let { dispatch, peripherals } = this.props;
    let { isEditing } = this.state;

    let isSaving = peripherals && peripherals
      .filter(x => x.saving).length !== 0;

    let isDirty = peripherals && peripherals
      .filter(x => x.dirty).length !== 0;

    let isSaved = !isSaving && !isDirty;

    return <Widget className="peripherals-widget">
      <WidgetHeader title={"Peripherals"} helpText={ToolTips.PERIPHERALS}>
        <button
          className="fb-button gray"
          onClick={this.toggle}
          hidden={!isSaved}>
          {!isEditing && t("Edit")}
          {isEditing && t("Back")}
        </button>
        <SaveBtn
          hidden={!isEditing}
          isDirty={isDirty}
          isSaving={isSaving}
          isSaved={isSaved}
          onClick={this.maybeSave}
        />
        <button
          hidden={!isEditing}
          className="fb-button green"
          type="button"
          onClick={() => { dispatch(init(this.emptyPeripheral())) }}>
          <i className="fa fa-plus" />
        </button>
      </WidgetHeader>
      <WidgetBody>
        {this.showPins()}
      </WidgetBody>
    </Widget>;
  };
}
