import React from "react";
import { t } from "../i18next_wrapper";
import { ToggleButton } from "../ui";

export const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

interface ThreeDRequiredOverlayProps {
  onSwitchTo2D?: () => void;
}

export const ThreeDRequiredOverlay =
  (props: ThreeDRequiredOverlayProps) =>
    <div className={"three-d-required-overlay"} role={"alert"}>
      <i className={"fa fa-exclamation-triangle"} aria-hidden={true} />
      <h2>{t("3D graphics unavailable")}</h2>
      <p>{t(`This 3D view requires WebGL. Enable WebGL and hardware
        acceleration in your browser settings, then restart your browser and
        reload this page.`)}</p>
      {props.onSwitchTo2D &&
        <div className={"three-d-required-toggle"}>
          <label>{t("2D")}</label>
          <ToggleButton
            title={t("switch to 2D")}
            toggleValue={true}
            customText={{ textTrue: "", textFalse: "" }}
            toggleAction={props.onSwitchTo2D} />
          <label>{t("3D")}</label>
        </div>}
    </div>;

interface ThreeDGuardProps extends ThreeDRequiredOverlayProps {
  children: React.ReactNode;
}

export const ThreeDGuard = (props: ThreeDGuardProps) => {
  const available = React.useMemo(() => isWebGLAvailable(), []);
  return available
    ? props.children
    : <ThreeDRequiredOverlay onSwitchTo2D={props.onSwitchTo2D} />;
};
