import { t } from "i18next";
import { Color, DropDownItem } from "../ui";
import { Curve } from "farmbot/dist/resources/api_resources";
import { TaggedCurve } from "farmbot";
import { PanelColor } from "../farm_designer/panel_header";

export enum CurveType {
  water = "water",
  spread = "spread",
  height = "height",
}

export const curvePanelColor = (curve: TaggedCurve | undefined) => {
  switch (curve?.body.type) {
    case CurveType.water: return Color.curveBlue;
    case CurveType.spread: return Color.curveGreen;
    case CurveType.height: return Color.curvePurple;
    default: return PanelColor.lightGray;
  }
};

export const curveColor = (curve: TaggedCurve) => {
  switch (curve.body.type) {
    case CurveType.water: return Color.curveDarkBlue;
    case CurveType.spread: return Color.curveDarkGreen;
    case CurveType.height: return Color.curveDarkPurple;
  }
};

export enum CurveShape {
  linear = "linear",
  table = "table",
}

export const CURVE_SHAPE_DDIS = (): Record<CurveShape, DropDownItem> => ({
  [CurveShape.linear]: { label: t("Linear"), value: CurveShape.linear },
  [CurveShape.table]: { label: t("Table"), value: CurveShape.table },
});

export const CURVE_TEMPLATES: Record<CurveShape, Curve["data"]> = {
  [CurveShape.linear]: { 1: 1, 2: 2 },
  [CurveShape.table]: { 1: 1, 2: 2, 3: 2, 4: 1 },
};

export const DEFAULT_DAY_SCALE = {
  [CurveType.water]: 60,
  [CurveType.spread]: 60,
  [CurveType.height]: 60,
};
export const DEFAULT_VALUE_SCALE = {
  [CurveType.water]: 500,
  [CurveType.spread]: 300,
  [CurveType.height]: 300,
};
