import * as React from "react";
import { WidgetHeader, Widget, WidgetBody } from "../../ui/index";
import { LabsFeaturesList } from "./labs_features_list_ui";
import { maybeToggleFeature } from "./labs_features_list_data";
import { t } from "i18next";
import { ToolTips } from "../../constants";

export class LabsFeatures extends React.Component<{}, {}> {
  state = {};

  render() {
    return <Widget className="peripherals-widget">
      <WidgetHeader title={t("App Settings")}
        helpText={ToolTips.LABS}>
      </WidgetHeader>
      <WidgetBody>
        <LabsFeaturesList onToggle={(x) => {
          maybeToggleFeature(x);
          this.forceUpdate();
        }} />
      </WidgetBody>
    </Widget>;
  }
}
