import React from "react";
import {
  PlantGridKey, GridInputProps, InputCellProps,
} from "./interfaces";
import { Row } from "../../ui";
import { t } from "../../i18next_wrapper";
import { UseCurrentLocation } from "../../tools/tool_slot_edit_components";
import { gridInputStep } from "./grid_math";

export const getLabel = (
  gridKey: PlantGridKey,
  itemType: "points" | "plants",
): string => {
  switch (gridKey) {
    case "startX":
    case "startY":
      return t("Start");
    case "spacingH":
    case "spacingV":
      return t("Spacing (MM)");
    case "numPlantsH":
    case "numPlantsV":
      return itemType == "points" ? t("# of points") : t("# of plants");
  }
};

export function InputCell(props: InputCellProps) {
  const { gridKey, onChange, grid } = props;
  const [value, setValue] = React.useState("" + grid[gridKey]);
  const editing = React.useRef(false);
  const committedValue = grid[gridKey];
  React.useEffect(() => {
    if (!editing.current) { setValue("" + committedValue); }
  }, [committedValue]);
  const validValue = (number: number) => {
    if (!Number.isInteger(number)) { return false; }
    if (gridKey == "numPlantsH" || gridKey == "numPlantsV") {
      return number >= 1;
    }
    if (gridKey == "spacingH" || gridKey == "spacingV") {
      return number != 0;
    }
    return true;
  };
  const emit = (nextValue: string) => {
    setValue(nextValue);
    if (!/^-?\d+$/.test(nextValue)) { return; }
    const number = parseInt(nextValue, 10);
    validValue(number) && onChange(gridKey, number);
  };
  const step = (direction: 1 | -1) => {
    const parsed = /^-?\d+$/.test(value) ? parseInt(value, 10) : committedValue;
    let next = parsed + direction * gridInputStep(gridKey);
    if ((gridKey == "numPlantsH" || gridKey == "numPlantsV") && next < 1) {
      next = 1;
    }
    if ((gridKey == "spacingH" || gridKey == "spacingV") && next == 0) {
      next = direction;
    }
    emit("" + next);
  };
  const axis = gridKey.endsWith("H") || gridKey.endsWith("X") ? "X" : "Y";
  const label = `${getLabel(gridKey, props.itemType)} ${axis}`;
  return <div className={"grid-input-cell"}>
    <input name={gridKey} className={gridKey}
      type={"number"}
      value={value}
      step={gridInputStep(gridKey)}
      disabled={props.disabled}
      aria-label={label}
      onFocus={() => { editing.current = true; }}
      onBlur={() => {
        const number = /^-?\d+$/.test(value)
          ? parseInt(value, 10)
          : NaN;
        if (!isNaN(number) && validValue(number)) {
          onChange(gridKey, number);
        } else {
          setValue("" + committedValue);
        }
        editing.current = false;
      }}
      onKeyDown={e => {
        if (e.key != "ArrowUp" && e.key != "ArrowDown") { return; }
        e.preventDefault();
        step(e.key == "ArrowUp" ? 1 : -1);
      }}
      onChange={e => emit(e.currentTarget.value)} />
    <div className={"grid-input-stepper"}>
      <button type={"button"}
        className={"fa fa-caret-up"}
        disabled={props.disabled}
        aria-label={`${t("Increase")} ${label}`}
        onClick={() => step(1)} />
      <button type={"button"}
        className={"fa fa-caret-down"}
        disabled={props.disabled}
        aria-label={`${t("Decrease")} ${label}`}
        onClick={() => step(-1)} />
    </div>
  </div>;
}

const pairs: [PlantGridKey, PlantGridKey][] = [
  ["startX", "startY"],
  ["numPlantsH", "numPlantsV"],
  ["spacingH", "spacingV"],
];

export function GridInput(props: GridInputProps) {
  const { xy_swap } = props;
  const vertical = "fa-arrows-v";
  const horizontal = "fa-arrows-h";
  return <div className="grid">
    <Row className="grid-planting-grid">
      <div></div>
      <div>
        <label>X</label>
        <i className={`fa ${xy_swap ? vertical : horizontal}`} />
      </div>
      <div>
        <label>Y</label>
        <i className={`fa ${xy_swap ? horizontal : vertical}`} />
      </div>
    </Row>
    {pairs.map(([left, right]) =>
      <Row key={left + right} className="grid-planting-grid">
        <div className="row grid-exp-1">
          <label>{getLabel(left, props.itemType)}</label>
          {left == "startX" &&
            <UseCurrentLocation botPosition={props.botPosition}
              onChange={props.onUseCurrentPosition} />}
        </div>
        <InputCell
          itemType={props.itemType}
          xy_swap={props.xy_swap}
          gridKey={left}
          disabled={props.disabled}
          onChange={props.onChange}
          grid={props.grid} />
        <InputCell
          itemType={props.itemType}
          xy_swap={props.xy_swap}
          gridKey={right}
          disabled={props.disabled}
          onChange={props.onChange}
          grid={props.grid} />
      </Row>)}
  </div>;
}
