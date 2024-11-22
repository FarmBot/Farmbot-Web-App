import React from "react";
import { t } from "../i18next_wrapper";
import { TaggedGenericPointer, TaggedPoint } from "farmbot";
import { round } from "lodash";
import { edit, save } from "../api/crud";
import { Everything } from "../interfaces";
import { getFbosConfig } from "../resources/getters";
import { SourceFbosConfig } from "../devices/interfaces";
import { Row, BlurableInput } from "../ui";

export const MEASURE_SOIL_HEIGHT_NAME = "measure-soil-height";

export const soilHeightPoint = (point: TaggedPoint) =>
  (point.body.meta.created_by == MEASURE_SOIL_HEIGHT_NAME
    || point.body.meta.at_soil_level == "true")
  && point.body.meta.at_soil_level != "false";

export const tagAsSoilHeight = (point: TaggedGenericPointer) => {
  point.body.meta.at_soil_level = "true";
  return point;
};

export const toggleSoilHeight = (point: TaggedPoint) => ({
  meta: {
    ...point.body.meta,
    at_soil_level: "" + !soilHeightPoint(point),
  }
});

export const soilHeightQuery: Record<string, string> = {
  at_soil_level: "true",
};

export const soilHeightColorQuery = (color: string) => ({
  at_soil_level: "true",
  color,
});

export const getSoilHeightColor =
  (genericPoints: TaggedGenericPointer[]) => {
    const soilHeights = genericPoints
      .filter(soilHeightPoint)
      .map(p => p.body.z);
    const min = Math.min(...soilHeights);
    const max = Math.max(...soilHeights);
    return (z: number) => {
      const normalizedZ = round(255 * (max > min ? (z - min) / (max - min) : 1));
      return `rgb(${normalizedZ}, ${normalizedZ}, ${normalizedZ})`;
    };
  };

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
