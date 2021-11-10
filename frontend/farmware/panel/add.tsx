import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { initSave } from "../../api/crud";
import { push } from "../../history";
import { error } from "../../toast/toast";
import { Path } from "../../internal_urls";

export interface DesignerFarmwareAddProps {
  dispatch: Function;
}

export const mapStateToProps = (props: Everything): DesignerFarmwareAddProps => {
  return {
    dispatch: props.dispatch,
  };
};

interface FarmwareAddState {
  packageUrl: string;
}

export class RawDesignerFarmwareAdd
  extends React.Component<DesignerFarmwareAddProps, FarmwareAddState> {
  state: FarmwareAddState = { packageUrl: "" };

  clearUrl = () => push(Path.farmware());

  install = () => {
    const url = this.state.packageUrl;
    if (url) {
      this.props.dispatch(initSave("FarmwareInstallation",
        { url, package: undefined, package_error: undefined }))
        .then(this.clearUrl);
    } else {
      error(t("Please enter a URL"));
    }
  };

  render() {
    const panelName = "farmware-add";
    return <DesignerPanel panelName={panelName} panel={Panel.Farmware}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Farmware}
        title={t("Install new Farmware")}
        backTo={Path.farmware()} />
      <DesignerPanelContent panelName={panelName}>
        <label>
          {t("Farmware manifest URL")}
        </label>
        <fieldset>
          <input type="url" name="url"
            placeholder={"https://...."}
            value={this.state.packageUrl || ""}
            onChange={e => this.setState({ packageUrl: e.currentTarget.value })} />
          <button
            className="fb-button green"
            title={t("install Farmware")}
            onClick={this.install}>
            {t("Install")}
          </button>
        </fieldset>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerFarmwareAdd = connect(mapStateToProps)(RawDesignerFarmwareAdd);
