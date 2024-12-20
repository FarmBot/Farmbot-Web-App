import React from "react";
import { t } from "../i18next_wrapper";

interface BackArrowProps {
  onClick?(): void;
}
export function BackArrow(props: BackArrowProps) {
  const onClick = () => {
    history.back();
    props.onClick?.();
  };

  return <a onClick={onClick} title={t("go back")} className="back-arrow">
    <i className="fa fa-arrow-left" />
  </a>;
}
