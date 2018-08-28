import * as React from "react";
import { Col, FBSelect, DropDownItem, NULL_CHOICE } from "../../../ui";

interface ResourceSelectorProps {
  title: string;
  list: DropDownItem[];
  selected?: DropDownItem;
  onChange: (d: DropDownItem) => void;
}

export const ResourceSelector =
  ({ title, list, onChange, selected }: ResourceSelectorProps) => {
    return <Col xs={6}>
      <label>{title}</label>
      <FBSelect
        list={list}
        onChange={onChange}
        selectedItem={selected || NULL_CHOICE} />
    </Col>;
  };
