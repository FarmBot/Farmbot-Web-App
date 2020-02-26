import * as React from "react";

interface BackArrowProps {
  onClick?(): void;
}
export function BackArrow(props: BackArrowProps) {
  const onClick = () => {
    history.back();
    props.onClick?.();
  };

  return <a onClick={onClick} className="back-arrow">
    <i className="fa fa-arrow-left" />
  </a>;
}
