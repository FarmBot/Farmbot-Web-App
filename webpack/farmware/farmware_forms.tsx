import * as React from "react";
import { Widget, WidgetHeader, WidgetBody, Col } from "../ui/index";
import { t } from "i18next";
import { FarmwareManifest, Dictionary } from "farmbot";
import { betterCompact } from "../util";
import { getDevice } from "../device";

interface FarmwareFormsProps {
  farmwares: Dictionary<FarmwareManifest | undefined>;
}

// TODO: download and parse the "manifest.json" file instead.
const firstParty = [
  "camera-calibration",
  "historical-camera-calibration",
  "take-photo",
  "plant-detection",
  "historical-plant-detection"];

export function FarmwareForms(props: FarmwareFormsProps): JSX.Element {
  const { farmwares } = props;
  const farmwareData = betterCompact(Object
    .keys(farmwares)
    .map(x => farmwares[x]))
    .map((fw) => {
      // TODO: Add optional "config" field to farmbot-js and check for it here.
      const needsWidget = !firstParty.includes(fw.name);
      return needsWidget ? fw : undefined;
    });
  return <div id="farmware-forms">
    {farmwareData.map((farmware, i) => {
      return farmware ?
        <Col key={i} xs={12} sm={6}>
          <Widget>
            <WidgetHeader
              title={farmware.name}
              helpText={farmware.meta.version ? " version: "
                + farmware.meta.version : ""}>
              <button
                className="fb-button gray"
                onClick={() => getDevice().execScript(farmware.name)}>
                {t("Run")}
              </button>
            </WidgetHeader>
            <WidgetBody>
              {farmware.meta.description &&
                <div>
                  <label>Description</label>
                  <p>{farmware.meta.description}</p>
                </div>}
              {/* TODO: Render inputs described in "farmware.config". */}
            </WidgetBody>
          </Widget>
        </Col> : <div key={i} />;
    })}
  </div>;
}
