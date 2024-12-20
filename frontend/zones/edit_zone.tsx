import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { useNavigate } from "react-router";
import { Everything } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import { selectAllPointGroups } from "../resources/selectors";
import { TaggedPointGroup } from "farmbot";
import { edit, save } from "../api/crud";
import { LocationSelection } from "../point_groups/criteria";
import { BotSize } from "../farm_designer/map/interfaces";
import { botSize } from "../farm_designer/state_to_props";
import { Path } from "../internal_urls";

export interface EditZoneProps {
  dispatch: Function;
  findZone(id: number): TaggedPointGroup | undefined;
  botSize: BotSize;
}

export const mapStateToProps = (props: Everything): EditZoneProps => ({
  dispatch: props.dispatch,
  findZone: id => selectAllPointGroups(props.resources.index)
    .filter(g => g.body.id == id)[0],
  botSize: botSize(props),
});

export const RawEditZone = (props: EditZoneProps) => {
  const getZone = () => {
    const stringyID = Path.getSlug(Path.zones());
    if (stringyID) {
      return props.findZone(parseInt(stringyID));
    }
  };
  const zone = getZone();
  const navigate = useNavigate();
  const zonesPath = Path.zones();
  !zone && Path.startsWith(zonesPath) && navigate(zonesPath);
  return <DesignerPanel panelName={"zone-info"} panel={Panel.Zones}>
    <DesignerPanelHeader
      panelName={"zone-info"}
      panel={Panel.Zones}
      title={`${t("Edit")} zone`}
      backTo={zonesPath} />
    <DesignerPanelContent panelName={"zone-info"}>
      {zone
        ? <div className={"zone-info-panel-content-wrapper"}>
          <label>{t("zone name")}</label>
          <input name="zoneName"
            defaultValue={zone.body.name}
            onBlur={e => {
              props.dispatch(edit(zone, { name: e.currentTarget.value }));
              props.dispatch(save(zone.uuid));
            }} />
          <LocationSelection
            group={zone}
            criteria={zone.body.criteria}
            dispatch={props.dispatch}
            botSize={props.botSize}
            editGroupAreaInMap={true} />
        </div>
        : <span>{t("Redirecting")}...</span>}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const EditZone = connect(mapStateToProps)(RawEditZone);
// eslint-disable-next-line import/no-default-export
export default EditZone;
