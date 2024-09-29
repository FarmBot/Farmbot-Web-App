import React from "react";
import { ErrorBoundary } from "../error_boundary";

export interface SearchFieldProps {
  nameKey: string;
  onChange(searchTerm: string): void;
  onKeyPress?: (searchTerm: string) => void;
  onEnter?: () => void;
  searchTerm: string;
  placeholder: string;
  customLeftIcon?: React.ReactElement;
  customRightIcon?: React.ReactElement;
  autoFocus?: boolean;
}

export const SearchField = (props: SearchFieldProps) =>
  <div className="thin-search-wrapper">
    <div className="text-input-wrapper">
      <ErrorBoundary>
        {props.customLeftIcon || <i className="fa fa-search" />}
        <input name={props.nameKey + "SearchTerm"}
          value={props.searchTerm}
          autoFocus={props.autoFocus}
          onChange={e => props.onChange(e.currentTarget.value)}
          onKeyPress={e => {
            e.key == "Enter" && props.onEnter?.();
            props.onKeyPress?.(e.currentTarget.value);
          }}
          placeholder={props.placeholder} />
        {props.searchTerm && (props.customRightIcon ||
          <i className="fa fa-times" onClick={() => props.onChange("")} />)}
      </ErrorBoundary>
    </div>
  </div>;
