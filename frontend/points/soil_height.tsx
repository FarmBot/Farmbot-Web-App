import React from "react";
import { t } from "../i18next_wrapper";
import { edit, save } from "../api/crud";
import { Everything } from "../interfaces";
import { getFbosConfig } from "../resources/getters";
import { SourceFbosConfig } from "../devices/interfaces";
import { Row, BlurableInput } from "../ui";

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
}

export const EditSoilHeight = (props: EditSoilHeightProps) => {
  const { sourceFbosConfig } = props;
  return <Row className="grid-exp-1">
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
  </Row>;
};
