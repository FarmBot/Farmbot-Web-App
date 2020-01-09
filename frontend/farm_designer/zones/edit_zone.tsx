import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { history, getPathArray } from "../../history";
import { Everything } from "../../interfaces";
import { Panel } from "../panel_header";

export interface EditZoneProps {
  dispatch: Function;
  findZone(id: number): string | undefined;
}

export const mapStateToProps = (props: Everything): EditZoneProps => ({
  dispatch: props.dispatch,
  findZone: _id => undefined,
});

export class RawEditZone extends React.Component<EditZoneProps, {}> {
  get stringyID() { return getPathArray()[4] || ""; }
  get zone() {
    if (this.stringyID) {
      return this.props.findZone(parseInt(this.stringyID));
    }
  }

  fallback = () => {
    history.push("/app/designer/zones");
    return <span>{t("Redirecting...")}</span>;
  }

  default = () => {
    return <DesignerPanel panelName={"zone-info"} panel={Panel.Zones}>
      <DesignerPanelHeader
        panelName={"zone-info"}
        panel={Panel.Zones}
        title={`${t("Edit")} zone`}
        backTo={"/app/designer/zones"} />
      <DesignerPanelContent panelName={"zone-info"}>
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.zone ? this.default() : this.fallback();
  }
}

export const EditZone = connect(mapStateToProps)(RawEditZone);
