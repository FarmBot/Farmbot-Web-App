import * as React from "react";

export class ControlsPopup extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="controls-popup">
        <i className="fa fa-plus" />
        <div className="controls-popup-menu-outer">
          <div className="controls-popup-menu-inner">
            Content
          </div>
        </div>
      </div>
    );
  }
}
