import React from "react";
import { t } from "../i18next_wrapper";
import { edit, save } from "../api/crud";
import { Everything } from "../interfaces";
import { getFbosConfig } from "../resources/getters";
import { SourceFbosConfig } from "../devices/interfaces";
import { Row, BlurableInput } from "../ui";
import { isUndefined } from "lodash";

export {
  MEASURE_SOIL_HEIGHT_NAME,
  getSoilHeightColor,
  soilHeightColorQuery,
  soilHeightPoint,
  soilHeightQuery,
  tagAsSoilHeight,
  toggleSoilHeight
} from "./soil_height_helpers";

const setSoilHeight = (soilHeight: number) =>
  (dispatch: Function, getState: () => Everything) => {
    const fbosConfig = getFbosConfig(getState().resources.index);
    if (fbosConfig) {
      dispatch(edit(fbosConfig, { soil_height: soilHeight }));
      dispatch(save(fbosConfig.uuid));
    }
  };

export interface EditSoilHeightProps {
  dispatch: Function;
  sourceFbosConfig?: SourceFbosConfig;
  averageZ: number;
  minZ?: number;
  maxZ?: number;
}

export const EditSoilHeight = (props: EditSoilHeightProps) => {
  const { sourceFbosConfig } = props;
  return <div className={"grid soil-height-summary"}>
    <Row className="grid-exp-1">
      {sourceFbosConfig && <label>{t("FarmBot soil z")}</label>}
      {sourceFbosConfig && <BlurableInput type="number"
        onCommit={e =>
          props.dispatch(setSoilHeight(parseFloat(e.currentTarget.value)))}
        value={parseFloat("" + sourceFbosConfig("soil_height").value)} />}
      <button className={"fb-button gray"}
        title={t("use average soil height")}
        onClick={() => props.dispatch(setSoilHeight(props.averageZ))}>
        {t("use average z: {{ value }}", { value: props.averageZ })}
      </button>
    </Row>
    {!isUndefined(props.minZ) && <Row className={"grid-exp-1"}>
      <label>{t("Min soil z")}</label>
      <input type={"number"} value={props.minZ} disabled={true} />
    </Row>}
    {!isUndefined(props.maxZ) && <Row className={"grid-exp-1"}>
      <label>{t("Max soil z")}</label>
      <input type={"number"} value={props.maxZ} disabled={true} />
    </Row>}
  </div>;
};
