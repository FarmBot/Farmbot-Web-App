import React from "react";
import { DirectionButton } from "./controls/move/direction_button";
import { buildDirectionProps } from "./controls/move/direction_axes_props";
import { ControlsPopupProps } from "./controls/move/interfaces";
import { mapPanelClassName } from "./farm_designer/map/util";
import { getPathArray } from "./history";
import { TakePhotoButton } from "./controls/move/take_photo_button";
import { HomeButton } from "./controls/move/home_button";
import { FBSelect } from "./ui";
import { changeStepSize } from "./devices/actions";

export const ControlsPopup = (props: ControlsPopupProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isOpenClass = isOpen ? "open" : "";
  const { stepSize, xySwap, arduinoBusy, botOnline } = props;
  const directionAxesProps = buildDirectionProps(props);
  const rightLeft = xySwap ? "y" : "x";
  const upDown = xySwap ? "x" : "y";
  const movementDisabled = !isOpen || arduinoBusy || !botOnline;
  const commonProps = { steps: stepSize, disabled: movementDisabled };
  return <div
    className={`controls-popup ${isOpenClass} ${mapPanelClassName()}`}>
    <i className="fa fa-crosshairs" onClick={() => setIsOpen(!isOpen)} />
    <div className="controls-popup-menu-outer">
      <div className="controls-popup-menu-inner">
        <DirectionButton {...commonProps}
          axis={rightLeft}
          direction="right"
          directionAxisProps={directionAxesProps[rightLeft]} />
        <DirectionButton {...commonProps}
          axis={upDown}
          direction="up"
          directionAxisProps={directionAxesProps[upDown]} />
        <DirectionButton {...commonProps}
          axis={upDown}
          direction="down"
          directionAxisProps={directionAxesProps[upDown]} />
        <DirectionButton {...commonProps}
          axis={rightLeft}
          direction="left"
          directionAxisProps={directionAxesProps[rightLeft]} />
        <FBSelect
          list={[1, 10, 100, 1000, 10000].map(stepSize =>
            ({ label: "" + stepSize, value: stepSize }))}
          onChange={ddi =>
            props.dispatch(changeStepSize(parseInt("" + ddi.value)))}
          selectedItem={{ label: "" + stepSize, value: stepSize }} />
        <HomeButton doFindHome={true}
          disabled={!isOpen || !botOnline || arduinoBusy} />
        <HomeButton doFindHome={false}
          disabled={!isOpen || !botOnline || arduinoBusy} />
        <TakePhotoButton env={props.env} disabled={!isOpen || !botOnline} />
      </div>
    </div>
  </div>;
};

export const showControlsPopup = () => {
  const currentPage = getPathArray()[2] || "";
  const currentPanel = getPathArray()[3] || "";
  const pagesNotShown = ["account", "regimens"];
  const panelsNotShown = ["controls"];
  const hide = pagesNotShown.includes(currentPage)
    || (currentPage == "designer" && panelsNotShown.includes(currentPanel));
  return !hide;
};
