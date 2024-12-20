import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { initSave } from "../../api/crud";
import { useNavigate } from "react-router";
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

export const RawDesignerFarmwareAdd = (props: DesignerFarmwareAddProps) => {
  const [packageUrl, setPackageUrl] = React.useState("");
  const navigate = useNavigate();
  const clearUrl = () => { navigate(Path.farmware()); };

  const install = () => {
    const url = packageUrl;
    if (url) {
      props.dispatch(initSave("FarmwareInstallation",
        { url, package: undefined, package_error: undefined }))
        .then(clearUrl);
    } else {
      error(t("Please enter a URL"));
    }
  };

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
          value={packageUrl || ""}
          onChange={e => setPackageUrl(e.currentTarget.value)} />
        <button
          className="fb-button green"
          title={t("install Farmware")}
          onClick={install}>
          {t("Install")}
        </button>
      </fieldset>
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const DesignerFarmwareAdd = connect(mapStateToProps)(RawDesignerFarmwareAdd);
// eslint-disable-next-line import/no-default-export
export default DesignerFarmwareAdd;
