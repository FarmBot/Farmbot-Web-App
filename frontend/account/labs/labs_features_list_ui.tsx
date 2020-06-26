import * as React from "react";
import { fetchLabFeatures, LabsFeature } from "./labs_features_list_data";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { Row, Col } from "../../ui";
import { ToggleButton } from "../../controls/toggle_button";
import { t } from "../../i18next_wrapper";

export interface LabsFeaturesListProps {
  onToggle(feature: LabsFeature): Promise<void>;
  getConfigValue: GetWebAppConfigValue;
}

export function LabsFeaturesList(props: LabsFeaturesListProps) {
  return <div className="labs-features-list">
    {fetchLabFeatures(props.getConfigValue).map((feature, i) => {
      const displayValue = feature.displayInvert ? !feature.value : feature.value;
      return <Row key={i}>
        <Col xs={4}>
          <label>{t(feature.name)}</label>
        </Col>
        <Col xs={6}>
          <p>{t(feature.description)}</p>
        </Col>
        <Col xs={2}>
          <ToggleButton
            title={t("toggle feature")}
            toggleValue={displayValue ? 1 : 0}
            toggleAction={() => props.onToggle(feature)
              .then(() => feature.callback && feature.callback())}
            customText={{ textFalse: t("off"), textTrue: t("on") }} />
        </Col>
      </Row>;
    })}
  </div>;
}
