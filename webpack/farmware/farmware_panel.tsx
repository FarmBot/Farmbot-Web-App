import * as React from "react";
import * as _ from "lodash";
import { t } from "i18next";
import { getDevice } from "../device";
import {
  FWProps, FWState, FarmwareConfigMenuProps
} from "./interfaces";
import { MustBeOnline } from "../devices/must_be_online";
import { ToolTips, Content } from "../constants";
import {
  Widget, WidgetHeader, WidgetBody,
  Row, Col,
  FBSelect, DropDownItem
} from "../ui/index";
import { betterCompact } from "../util";
import { Popover, Position } from "@blueprintjs/core";

export function FarmwareConfigMenu(props: FarmwareConfigMenuProps) {
  const listBtnColor = props.show ? "green" : "red";
  return <div>
    <label>
      {t("First-party Farmware")}
    </label>
    <fieldset>
      <label>
        {t("Reinstall")}
      </label>
      <button
        className="fb-button gray fa fa-download"
        onClick={() => getDevice().installFirstPartyFarmware()}
        disabled={props.firstPartyFwsInstalled} />
    </fieldset>
    <fieldset>
      <label>
        {t("Show in list")}
      </label>
      <button
        className={"fb-button fb-toggle-button " + listBtnColor}
        onClick={props.onToggle} />
    </fieldset>
  </div>;
}

export class FarmwarePanel extends React.Component<FWProps, Partial<FWState>> {
  constructor(props: FWProps) {
    super(props);
    this.state = {};
  }

  /** Keep null checking DRY for this.state.selectedFarmware */
  ifFarmwareSelected = (cb: (label: string) => void) => {
    const { selectedFarmware } = this.state;
    selectedFarmware ? cb(selectedFarmware) : alert("Select a farmware first.");
  }

  update = () => {
    this
      .ifFarmwareSelected(label => getDevice()
        .updateFarmware(label)
        .then(() => this.setState({ selectedFarmware: undefined })));
  }

  remove = () => {
    this
      .ifFarmwareSelected(label => {
        const { firstPartyFarmwareNames } = this.props;
        const isFirstParty = firstPartyFarmwareNames &&
          firstPartyFarmwareNames.includes(label);
        if (!isFirstParty || confirm(Content.FIRST_PARTY_WARNING)) {
          getDevice()
            .removeFarmware(label)
            .then(() => this.setState({ selectedFarmware: undefined }));
        }
      });
  }

  run = () => {
    this
      .ifFarmwareSelected(label => getDevice()
        .execScript(label)
        .then(() => this.setState({ selectedFarmware: label })));
  }

  install = () => {
    if (this.state.packageUrl) {
      getDevice()
        .installFarmware(this.state.packageUrl)
        .then(() => this.setState({ packageUrl: "" }));
    } else {
      alert(t("Enter a URL"));
    }
  }

  firstPartyFarmwaresPresent = (firstPartyList: string[] | undefined) => {
    const fws = this.props.farmwares;
    const farmwareList = betterCompact(Object.keys(fws)
      .map(x => fws[x]).map(x => x && x.name));
    const allPresent = _.every(
      firstPartyList, (value) => farmwareList.includes(value));
    return allPresent;
  }

  fwList = () => {
    const { farmwares, showFirstParty, firstPartyFarmwareNames } = this.props;
    const choices = betterCompact(Object
      .keys(farmwares)
      .map(x => farmwares[x]))
      .filter(x => (firstPartyFarmwareNames && !showFirstParty)
        ? !firstPartyFarmwareNames.includes(x.name) : x)
      .map((fw) => ({ value: fw.name, label: (`${fw.name} ${fw.meta.version}`) }));
    return choices;
  }

  selectedItem = (): DropDownItem | undefined => {
    const label = this.state.selectedFarmware;
    if (label) { return { label, value: 0 }; }
  }

  fwDescription = (selectedName: string | undefined) => {
    const { farmwares } = this.props;
    const description = betterCompact(Object
      .keys(farmwares)
      .map(x => farmwares[x]))
      .map((fw) => {
        const isSelected = (fw.name == selectedName);
        const label = isSelected ? (fw.meta || {}).description : "";
        return label;
      });
    return description;
  }

  render() {
    return <Widget className="farmware-widget">
      <WidgetHeader
        title="Farmware"
        helpText={ToolTips.FARMWARE}>
        <Popover position={Position.BOTTOM_RIGHT}>
          <i className="fa fa-gear" />
          <FarmwareConfigMenu
            show={this.props.showFirstParty}
            onToggle={() => this.props.onToggle("show_first_party_farmware")}
            firstPartyFwsInstalled={
              this.firstPartyFarmwaresPresent(
                this.props.firstPartyFarmwareNames)} />
        </Popover>
      </WidgetHeader>
      <WidgetBody>
        <MustBeOnline
          syncStatus={this.props.syncStatus}
          networkState={this.props.botToMqttStatus}
          lockOpen={process.env.NODE_ENV !== "production"}>
          <Row>
            <fieldset>
              <Col xs={12}>
                <input type="url"
                  placeholder={"https://...."}
                  value={this.state.packageUrl || ""}
                  onChange={(e) => {
                    this.setState({ packageUrl: e.currentTarget.value });
                  }} />
              </Col>
              <Col xs={12}>
                <button
                  className="fb-button green"
                  onClick={this.install}>
                  {t("Install")}
                </button>
              </Col>
            </fieldset>
          </Row>
          <Row>
            <fieldset>
              <Col xs={12}>
                <FBSelect
                  key={"farmware_" + this.selectedItem()}
                  list={this.fwList()}
                  selectedItem={this.selectedItem()}
                  onChange={(x) => {
                    const selectedFarmware = x.value;
                    if (_.isString(selectedFarmware)) {
                      this.setState({ selectedFarmware });
                    } else {
                      throw new Error(`Bad farmware name: ${x.value}`);
                    }
                  }}
                  placeholder="Installed Farmware Packages" />
              </Col>
              <Col xs={12}>
                <button
                  className="fb-button red"
                  onClick={this.remove}>
                  {t("Remove")}
                </button>
                <button
                  className="fb-button yellow"
                  onClick={this.update}>
                  {t("Update")}
                </button>
                <button
                  className="fb-button green"
                  onClick={this.run}>
                  {t("Run")}
                </button>
              </Col>
            </fieldset>
          </Row>
          <Row>
            <Col xs={12}>
              {this.fwDescription(this.state.selectedFarmware)}
            </Col>
          </Row>
        </MustBeOnline>
      </WidgetBody>
    </Widget>;
  }
}
