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
    let { selectedFarmware } = this.state;
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
        .then(() => this.setState({ selectedFarmware: undefined })));
  }

  install = () => {
    if (this.state.packageUrl) {
      devices
        .current
        .installFarmware(this.state.packageUrl)
        .then(() => this.setState({ packageUrl: "" }));
    } else {
      alert("Enter a URL");
    }
  }

  fwList = () => {
    let { farmwares } = this.props;
    let choices = betterCompact(Object
      .keys(farmwares)
      .map(x => farmwares[x]))
      .map((fw, i) => {
        let hasVers = (fw.meta && _.isString(fw.meta.version));
        // Guard against legacy Farmwares. Can be removed in a month.
        // -- RC June 2017.
        let label = hasVers ? `${fw.name} ${fw.meta.version}` : fw.name;
        return { value: fw.uuid, label };
      });
    return choices;
  }

  selectedItem = (): DropDownItem | undefined => {
    let label = this.state.selectedFarmware;
    if (label) { return { label, value: 0 }; }
  }

  fwDescription = (selectedUuid: string | undefined) => {
    let { farmwares } = this.props;
    let description = betterCompact(Object
      .keys(farmwares)
      .map(x => farmwares[x]))
      .map((fw, i) => {
        let isSelected = (fw.uuid == selectedUuid);
        let label = isSelected ? fw.meta.description : "";
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
            lockOpen={process.env.NODE_ENV !== "production"}
          >
            <Row>
              <fieldset>
                <Col xs={12}>
                  <input type="url"
                    placeholder={"https://...."}
                    value={this.state.packageUrl || ""}
                    onChange={(e) => {
                      this.setState({ packageUrl: e.currentTarget.value });
                    }}
                  />
                </Col>
                <Col xs={12}>
                  <button
                    className="fb-button green"
                    onClick={this.install}
                  >
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
                      let selectedFarmware = x.value;
                      if (_.isString(selectedFarmware)) {
                        this.setState({ selectedFarmware });
                      } else {
                        throw new Error(`Bad farmware UUID: ${x.value}`);
                      }
                    }}
                    placeholder="Installed Farmware Packages" />
                </Col>
                <Col xs={12}>
                  <button
                    className="fb-button red"
                    onClick={this.remove}
                  >
                    {t("Remove")}
                  </button>
                  <button
                    className="fb-button yellow"
                    onClick={this.update}
                  >
                    {t("Update")}
                  </button>
                  <button
                    className="fb-button green"
                    onClick={this.run}
                  >
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
