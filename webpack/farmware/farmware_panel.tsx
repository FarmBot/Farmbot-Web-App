import * as React from "react";
import * as _ from "lodash";
import { t } from "i18next";
import { devices } from "../device";
import { FWProps, FWState } from "./interfaces";
import { MustBeOnline } from "../devices/must_be_online";
import { ToolTips } from "../constants";
import {
  Widget,
  WidgetHeader,
  WidgetBody,
  Row,
  Col,
  DropDownItem
} from "../ui";
import { betterCompact } from "../util";
import { FBSelect } from "../ui/new_fb_select";

export class FarmwarePanel extends React.Component<FWProps, Partial<FWState>> {
  constructor() {
    super();
    this.state = {};
  }

  /** Keep null checking DRY for this.state.selectedFarmware */
  ifFarmwareSelected = (cb: (label: string) => void) => {
    const { selectedFarmware } = this.state;
    selectedFarmware ? cb(selectedFarmware) : alert("Select a farmware first.");
  }

  update = () => {
    this
      .ifFarmwareSelected(label => devices
        .current
        .updateFarmware(label)
        .then(() => this.setState({ selectedFarmware: undefined })));
  }

  remove = () => {
    this
      .ifFarmwareSelected(label => devices
        .current
        .removeFarmware(label)
        .then(() => this.setState({ selectedFarmware: undefined })));
  }

  run = () => {
    this
      .ifFarmwareSelected(label => devices
        .current
        .execScript(label)
        .then(() => this.setState({ selectedFarmware: label })));
  }

  install = () => {
    if (this.state.packageUrl) {
      devices
        .current
        .installFarmware(this.state.packageUrl)
        .then(() => this.setState({ packageUrl: "" }));
    } else {
      alert(t("Enter a URL"));
    }
  }

  fwList = () => {
    const { farmwares } = this.props;
    const choices = betterCompact(Object
      .keys(farmwares)
      .map(x => farmwares[x]))
      .map((fw, i) => {
        const hasVers = (fw.meta && _.isString(fw.meta.version));
        // Guard against legacy Farmwares. Can be removed in a month.
        // -- RC June 2017.
        const label = hasVers ? `${fw.name} ${fw.meta.version}` : fw.name;
        return { value: fw.name, label };
      });
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
      .map((fw, i) => {
        const isSelected = (fw.name == selectedName);
        // Rollbar 356. I think this was caused by a user on an ancient version
        // of FBOS. Remove in September '17. - RC 13 August.
        const label = isSelected ? (fw.meta || {}).description : "";
        return label;
      });
    return description;
  }

  render() {
    return (
      <Widget className="farmware-widget">
        <WidgetHeader title="Farmware" helpText={ToolTips.FARMWARE} />
        <WidgetBody>
          <MustBeOnline
            fallback="Not available when FarmBot is offline."
            status={this.props.syncStatus}
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
                  <FBSelect list={this.fwList()}
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
      </Widget>
    );
  }
}
