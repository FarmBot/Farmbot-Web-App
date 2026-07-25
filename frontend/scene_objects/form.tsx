import React from "react";
import { t } from "../i18next_wrapper";
import { FBSelect, DropDownItem, BlurableInput } from "../ui";
import {
  rolloverRotation, type SceneObjectFormValues,
} from "./interfaces";
export { rolloverRotation } from "./interfaces";
import type {
  SceneObjectAxis,
} from "../three_d_garden/scenes/scene_object_data";
import {
  sceneObjectShowsTextureAndColor,
  sceneObjectTextureChoices,
  validSceneObjectColor,
} from "./appearance";

export type { SceneObjectFormValues };

export interface SceneObjectFormFieldsProps {
  values: SceneObjectFormValues;
  onValueChange: (
    field: keyof SceneObjectFormValues,
    value: string | number | boolean,
  ) => void;
  focusedField?: string;
  showUnifiedSize?: boolean;
  onUnifiedSizeChange?(unified: boolean): void;
  onPreserveAxesChange?(axes: SceneObjectAxis[]): void;
  onFocusChange?(field: string | undefined): void;
  showPreserveAxes?: boolean;
  hideCubeControl?: boolean;
  hideVisibilityControl?: boolean;
}

type SceneObjectNumberField = Exclude<
  keyof SceneObjectFormValues,
  "name" | "texture" | "shape" | "color" | "show"
  | "x_origin" | "y_origin" | "z_origin" | "id" | "created_at" | "updated_at"
  | "preserve_axes"
>;
type SceneObjectOriginField = "x_origin" | "y_origin" | "z_origin";

const shapeChoices = (): DropDownItem[] => [
  { label: t("Box"), value: "box" },
  { label: t("Cylinder"), value: "cylinder" },
  { label: t("Plant"), value: "plant" },
  { label: t("Sphere"), value: "sphere" },
  { label: t("Tray"), value: "tray" },
  { label: t("Window"), value: "window" },
  { label: t("Laptop"), value: "laptop" },
  { label: t("Desk"), value: "desk" },
  { label: t("Solar Panel"), value: "solar" },
  { label: t("Tree"), value: "tree" },
  { label: t("Fence"), value: "fence" },
  { label: t("Astronaut"), value: "astronaut" },
  { label: t("HAB"), value: "hab" },
  { label: t("Rover"), value: "rover" },
];

interface SceneObjectFormField {
  id: string;
  label?: string;
  field: SceneObjectNumberField;
  originField?: SceneObjectOriginField;
  update?: (
    values: SceneObjectFormValues,
    value: number,
    onValueChange: SceneObjectFormFieldsProps["onValueChange"],
  ) => void;
}

const centerFields = (): SceneObjectFormField[] => [
  { id: "x_center", label: t("X"), field: "x_center", originField: "x_origin" },
  { id: "y_center", label: t("Y"), field: "y_center", originField: "y_origin" },
  { id: "z_base", label: t("Z"), field: "z_base", originField: "z_origin" },
];

const sizeFields = (): SceneObjectFormField[] => [
  { id: "x_size", label: t("X"), field: "x_size" },
  { id: "y_size", label: t("Y"), field: "y_size" },
  { id: "z_size", label: t("Z"), field: "z_size" },
];
const sizeFieldKeys = sizeFields().map(f => f.field);

const rotationFields = (): SceneObjectFormField[] => [
  { id: "rotation", field: "rotation" },
];

const combinedSizeField: SceneObjectFormField = {
  id: "size",
  field: "x_size",
  update: (_values, value, onValueChange) => {
    onValueChange("x_size", value);
    onValueChange("y_size", value);
    onValueChange("z_size", value);
  },
};

const fieldRows = () => [
  { id: "center", label: t("Center"), fields: centerFields() },
  { id: "size", label: t("Size"), fields: sizeFields() },
  { id: "rotation", label: t("Rotation"), fields: rotationFields() },
];

const originChoices = () => [
  { label: t("Home"), value: "home" },
  { label: t("Max"), value: "max" },
  { label: t("World"), value: "world" },
];

const sceneObjectAxes: SceneObjectAxis[] = ["x", "y", "z"];

interface SceneObjectFieldInputProps {
  disabled?: boolean;
  field: SceneObjectFormField;
  focusedField?: string;
  values: SceneObjectFormValues;
  onValueChange: SceneObjectFormFieldsProps["onValueChange"];
  onFocusChange?: SceneObjectFormFieldsProps["onFocusChange"];
}

const SceneObjectFieldInput = (props: SceneObjectFieldInputProps) => {
  const { field, focusedField, values, onFocusChange, onValueChange } = props;
  const hasOrigin = !!field.originField;
  const origin = field.originField ? values[field.originField] : undefined;
  const datumChoices = originChoices();
  const highlighted = focusedField == field.id;
  const input = <BlurableInput id={field.id}
    value={values[field.field]}
    name={field.id}
    type={"number"}
    className={highlighted ? "scene-object-field-highlight" : ""}
    disabled={props.disabled}
    allowEmpty={true}
    min={sizeFieldKeys.includes(field.field) ? 0 : -100000}
    max={100000}
    onFocus={() => onFocusChange?.(field.id)}
    onBlur={() => onFocusChange?.(undefined)}
    onCommit={e => {
      const inputValue = e.currentTarget.value;
      const nextValue = field.update
        ? parseFloat(inputValue) || 0
        : parseInt(inputValue) || 0;
      field.update
        ? field.update(values, nextValue, onValueChange)
        : onValueChange(field.field, nextValue);
    }} />;
  return <div className={"grid half-gap"}
    key={field.id}>
    {field.label &&
      <div className={"scene-object-field-label"}>
        <label htmlFor={field.id}>{field.label}</label>
        {["z_base", "y_center", "x_center"].includes(field.field) &&
          <button
            type={"button"}
            className={"fb-button gray scene-object-reset-z"}
            title={t("Reset")}
            onClick={() => onValueChange(field.field, 0)}>
            <i className={"fa fa-undo"} />
          </button>}
      </div>}
    {hasOrigin
      ? <div className={"row half-gap grid-2-col"}>
        {input}
        <FBSelect
          list={datumChoices}
          selectedItem={datumChoices.find(item => item.value === origin)
            || datumChoices[0]}
          onChange={item => field.originField &&
            onValueChange(field.originField, item.value)} />
      </div>
      : <div className={"grid half-gap grid-exp-1"}>
        {input}
      </div>}
  </div>;
};

export const SceneObjectFormFields = (props: SceneObjectFormFieldsProps) => {
  const { focusedField, values, onValueChange } = props;
  const shapes = shapeChoices();
  const rows = fieldRows();
  const [collapsedRows, setCollapsedRows] = React.useState<string[]>([]);
  const showUnifiedSize = !!props.showUnifiedSize;
  const showAppearance = sceneObjectShowsTextureAndColor(values.shape);
  const preservedAxes: SceneObjectAxis[] = values.preserve_axes || [];
  const togglePreservedAxis = (axis: SceneObjectAxis) => {
    const nextAxes: SceneObjectAxis[] = preservedAxes.includes(axis)
      ? preservedAxes.filter(item => item != axis)
      : [...preservedAxes, axis];
    props.onPreserveAxesChange?.(nextAxes);
  };
  const toggleRow = (row: string) => setCollapsedRows(current =>
    current.includes(row)
      ? current.filter(item => item != row)
      : [...current, row]);
  return <div className={"grid half-gap scene-object-form-fields"}>
    <div className={"row grid-3-col info-box"}>
      <div className={"grid half-gap"}>
        <label htmlFor={"shape"}>{t("Shape")}</label>
        <FBSelect
          list={shapes}
          selectedItem={shapes.find(item => item.value === values.shape)
            || shapes[0]}
          onChange={item => onValueChange("shape", item.value)} />
      </div>
      {showAppearance &&
        <div className={"grid half-gap"}>
          <label htmlFor={"texture"}>{t("Texture")}</label>
          <FBSelect
            list={sceneObjectTextureChoices}
            selectedItem={sceneObjectTextureChoices.find(item =>
              item.value === values.texture)
              || sceneObjectTextureChoices[0]}
            onChange={item => onValueChange("texture", item.value)}
            extraClass="fb-select" />
        </div>}
      {showAppearance &&
        <div className={"grid half-gap"}>
          <label htmlFor={"color"}>{t("Color")}</label>
          <div className={"row half-gap grid-exp-1"}>
            <input id={"color"}
              name={"color"}
              type={"color"}
              value={validSceneObjectColor(values.color)}
              onChange={e => onValueChange("color", e.currentTarget.value)} />
          </div>
        </div>}
      {!props.hideVisibilityControl &&
        <div className={"grid half-gap"}>
          <label htmlFor={"show"}>{t("Show")}</label>
          <input id={"show"}
            name={"show"}
            type={"checkbox"}
            checked={values.show}
            onChange={e => onValueChange("show", e.currentTarget.checked)} />
        </div>}
    </div>
    {rows.map(row => {
      const rowFields = row.id === "size" && showUnifiedSize
        ? [combinedSizeField]
        : row.fields;
      const collapsed = collapsedRows.includes(row.id);
      let fieldDataClass = "row grid-3-col plant-info-field-data";
      if (row.id === "center") {
        fieldDataClass = "grid half-gap plant-info-field-data";
      } else if (row.id === "rotation") {
        fieldDataClass = "row half-gap scene-object-rotation-data";
      }
      return <div className={"grid half-gap info-box"}
        key={row.id}>
        <div className={"row scene-object-section-header"}>
          <button type={"button"}
            className={"scene-object-section-toggle"}
            aria-expanded={!collapsed}
            onClick={() => toggleRow(row.id)}>
            <i className={`fa fa-caret-${collapsed ? "right" : "down"}`} />
            <span>{row.label}</span>
          </button>
          {row.id === "size" &&
            <div className={"row scene-object-size-actions"}>
              {!props.hideCubeControl && <label htmlFor={"cube"}>
                <input id={"cube"}
                  type={"checkbox"}
                  disabled={preservedAxes.length > 0}
                  checked={showUnifiedSize}
                  onChange={e => {
                    const checked = e.currentTarget.checked;
                    props.onUnifiedSizeChange?.(checked);
                    if (checked) {
                      onValueChange("y_size", values.x_size);
                      onValueChange("z_size", values.x_size);
                    }
                  }} />
                <span>{t("Cube")}</span>
              </label>}
            </div>}
        </div>
        {!collapsed && <div className={fieldDataClass}>
          {rowFields.map(field => {
            const axis = field.id.replace("_size", "") as SceneObjectAxis;
            return <SceneObjectFieldInput
              key={field.id}
              disabled={row.id === "size" && (field.id === "size"
                ? preservedAxes.length > 0
                : preservedAxes.includes(axis))}
              field={field}
              focusedField={focusedField}
              values={values}
              onFocusChange={props.onFocusChange}
              onValueChange={onValueChange} />;
          })}
          {row.id === "rotation" &&
            <div className={"row scene-object-rotation-actions"}>
              {[-90, 90].map(amount =>
                <button type={"button"}
                  key={amount}
                  className={"fb-button gray"}
                  onClick={() =>
                    onValueChange(
                      "rotation",
                      rolloverRotation(values.rotation + amount),
                    )}>
                  {amount > 0 ? `+${amount}` : amount}
                </button>)}
            </div>}
        </div>}
        {!collapsed && !showUnifiedSize
          && row.id === "size" && props.showPreserveAxes &&
          <div className={"row grid-3-col scene-object-preserve-axes"}>
            {sceneObjectAxes.map(axis =>
              <label key={axis} htmlFor={`preserve-${axis}`}>
                <input
                  id={`preserve-${axis}`}
                  aria-label={`${t("Fixed")} ${axis.toUpperCase()}`}
                  type={"checkbox"}
                  checked={preservedAxes.includes(axis)}
                  onChange={() => togglePreservedAxis(axis)} />
                <span>{t("Fixed")}</span>
              </label>)}
          </div>}
      </div>;
    })}
  </div>;
};
