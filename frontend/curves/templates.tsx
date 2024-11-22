import { t } from "i18next";
import { Color, DropDownItem } from "../ui";
import { Curve } from "farmbot/dist/resources/api_resources";
import { TaggedCurve } from "farmbot";

export enum CurveType {
  water = "water",
  spread = "spread",
  height = "height",
}

export const curvePanelColor = (curve: TaggedCurve) => {
  switch (curve.body.type) {
    case CurveType.water: return Color.curveBlue;
    case CurveType.spread: return Color.curveGreen;
    case CurveType.height: return Color.curvePurple;
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
  curve = "curve",
  constant = "constant",
}

export const CURVE_SHAPE_DDIS = (): Record<CurveShape, DropDownItem> => ({
  [CurveShape.linear]: { label: t("Linear Ramp"), value: CurveShape.linear },
  [CurveShape.table]: { label: t("Table"), value: CurveShape.table },
  [CurveShape.curve]: { label: t("S-Curve"), value: CurveShape.curve },
  [CurveShape.constant]: { label: t("Constant Value"), value: CurveShape.constant },
});

export const CURVE_TEMPLATES: Record<CurveShape, Curve["data"]> = {
  [CurveShape.linear]: { 1: 1, 2: 2 },
  [CurveShape.table]: { 1: 1, 2: 2, 3: 2, 4: 1 },
  [CurveShape.curve]: {
    1: 0, 10: 3, 20: 14, 27: 34, 33: 66, 40: 86, 50: 97, 60: 100,
  },
  [CurveShape.constant]: { 1: 1, 2: 1 },
};

export enum TemplateOption {
  shape = "shape",
  day = "day",
  value = "value",
}

const DEFAULTS = {
  [CurveType.water]: {
    [TemplateOption.shape]: CurveShape.table,
    [TemplateOption.day]: 60,
    [TemplateOption.value]: 500,
  },
  [CurveType.spread]: {
    [TemplateOption.shape]: CurveShape.table,
    [TemplateOption.day]: 60,
    [TemplateOption.value]: 300,
  },
  [CurveType.height]: {
    [TemplateOption.shape]: CurveShape.table,
    [TemplateOption.day]: 60,
    [TemplateOption.value]: 300,
  },
};

const templateStorageKey = (curveType: Curve["type"], option: TemplateOption) =>
  `${curveType}_${option}`;

const setTemplateOption =
  (curveType: Curve["type"], option: TemplateOption) =>
    (value: string | number) =>
      localStorage.setItem(templateStorageKey(curveType, option), "" + value);

export const getTemplateShape = (curveType: Curve["type"]): CurveShape => {
  const key = templateStorageKey(curveType, TemplateOption.shape);
  return localStorage.getItem(key) as CurveShape
    || DEFAULTS[curveType][TemplateOption.shape];
};

export const getTemplateShapeData = (curveType: Curve["type"]): Curve["data"] =>
  CURVE_TEMPLATES[getTemplateShape(curveType)];

export const getTemplateScale =
  (curveType: Curve["type"], option: TemplateOption): number => {
    const key = templateStorageKey(curveType, option);
    const value = localStorage.getItem(key);
    return value ? parseInt(value) : DEFAULTS[curveType][option] as number;
  };

export const templateShape = (curveType: Curve["type"]):
  [CurveShape, (value: string) => void] =>
  [
    getTemplateShape(curveType),
    setTemplateOption(curveType, TemplateOption.shape),
  ];

export const templateScale = (curveType: Curve["type"], option: TemplateOption):
  [number, (value: number) => void] =>
  [
    getTemplateScale(curveType, option),
    setTemplateOption(curveType, option),
  ];
