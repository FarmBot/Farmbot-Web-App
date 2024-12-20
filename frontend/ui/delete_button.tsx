import React from "react";
import { destroy } from "../api/crud";
import { t } from "../i18next_wrapper";
import { UUID } from "../resources/interfaces";
import { omit } from "lodash";

interface ButtonCustomProps {
  dispatch: Function;
  uuid: UUID;
  children?: React.ReactNode;
  onDestroy?: Function;
}

type ButtonHtmlProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

type DeleteButtonProps =
  ButtonCustomProps & ButtonHtmlProps;

/** Unfortunately, React will trigger a runtime
 * warning if we pass extra props to HTML elements */
const OMIT_THESE: Record<keyof ButtonCustomProps, true> = {
  "dispatch": true,
  "uuid": true,
  "children": true,
  "onDestroy": true,
};

export const DeleteButton = (props: DeleteButtonProps) =>
  <button
    {...omit(props, Object.keys(OMIT_THESE))}
    className={`red fb-button ${props.className}`}
    title={t("Delete")}
    onClick={() =>
      props.dispatch(destroy(props.uuid))
        .then(props.onDestroy || (() => { }))}>
    {props.children || <i className="fa fa-times" />}
  </button>;
