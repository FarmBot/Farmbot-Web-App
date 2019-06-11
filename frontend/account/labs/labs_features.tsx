import * as React from "react";
import { WidgetHeader, Widget, WidgetBody } from "../../ui/index";
import { LabsFeaturesList } from "./labs_features_list_ui";
import { maybeToggleFeature } from "./labs_features_list_data";
import { ToolTips } from "../../constants";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { t } from "../../i18next_wrapper";

interface LabsFeaturesProps {
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
}

export class LabsFeatures extends React.Component<LabsFeaturesProps, {}> {
  state = {};

  render() {
    const { getConfigValue, dispatch } = this.props;
    return <Widget className="app-settings-widget">
      <WidgetHeader title={t("App Settings")}
        helpText={ToolTips.LABS}>
      </WidgetHeader>
      <WidgetBody>
        <LabsFeaturesList
          getConfigValue={getConfigValue}
          onToggle={x => {
            maybeToggleFeature(getConfigValue, dispatch)(x);
            this.forceUpdate();
          }} />
      </WidgetBody>
    </Widget>;
  }
}
