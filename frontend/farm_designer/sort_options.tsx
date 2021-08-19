import React from "react";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { t } from "../i18next_wrapper";
import { Position } from "@blueprintjs/core";
import { sortBy } from "lodash";
import { Popover } from "../ui";

export interface SortOptions {
  sortBy?: keyof TaggedGenericPointer["body"];
  reverse?: boolean;
}

export interface PointSortMenuProps {
  sortOptions: SortOptions;
  onChange(options: SortOptions): void;
}

export const PointSortMenu = (props: PointSortMenuProps) => {
  const sortTerm = props.sortOptions.sortBy;
  const defaultSelected = sortTerm ? "" : "selected";
  const byAgeSelected = sortTerm == "created_at" ? "selected" : "";
  const byNameSelected = sortTerm == "name" ? "selected" : "";
  const bySizeSelected = sortTerm == "radius" ? "selected" : "";
  const zSelected = sortTerm == "z" ? "selected" : "";
  return <Popover position={Position.BOTTOM_RIGHT} usePortal={false}
    target={<i className="fa fa-search" />}
    content={<div className="point-sort-menu">
      <label>{t("sort by")}</label>
      <div>
        <i className={`fa fa-sort ${defaultSelected}`}
          title={t("default")}
          onClick={() =>
            props.onChange({ sortBy: undefined, reverse: false })} />
        <i className={`fa fa-calendar ${byAgeSelected}`}
          title={t("age")}
          onClick={() =>
            props.onChange({ sortBy: "created_at", reverse: false })} />
        <i className={`fa fa-font ${byNameSelected}`}
          title={t("name")}
          onClick={() =>
            props.onChange({ sortBy: "name", reverse: false })} />
        <i className={`fa fa-sort-amount-desc ${bySizeSelected}`}
          title={t("size")}
          onClick={() =>
            props.onChange({ sortBy: "radius", reverse: true })} />
        <i className={`z ${zSelected}`} title={t("z")} onClick={() =>
          props.onChange({ sortBy: "z", reverse: true })}>z</i>
      </div>
    </div>} />;
};

/** Sort and order points according to selected options. */
export const orderedPoints =
  <T extends TaggedGenericPointer | TaggedWeedPointer>(
    points: T[],
    sortOptions: SortOptions,
  ) => {
    const unsortedPoints = points.slice(0);
    const sortedPoints = sortOptions.sortBy
      ? sortBy(unsortedPoints, `body.${sortOptions.sortBy}`)
      : unsortedPoints;
    return sortOptions.reverse ? sortedPoints.reverse() : sortedPoints;
  };
