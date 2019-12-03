import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { GardenSnapshotProps, GardenSnapshot } from "./garden_snapshot";
import {
  selectAllPlantTemplates, findSavedGarden
} from "../../resources/selectors";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../plants/designer_panel";
import { Content } from "../../constants";
import { Row } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";

export const mapStateToProps = (props: Everything): GardenSnapshotProps => {
  const { openedSavedGarden } = props.resources.consumers.farm_designer;
  return {
    currentSavedGarden: openedSavedGarden
      ? findSavedGarden(props.resources.index, openedSavedGarden) : undefined,
    dispatch: props.dispatch,
    plantTemplates: selectAllPlantTemplates(props.resources.index),
  };
};

export class RawAddGarden extends React.Component<GardenSnapshotProps, {}> {
  render() {
    return <DesignerPanel panelName={"saved-garden"} panel={Panel.SavedGardens}>
      <DesignerPanelHeader
        panelName={"saved-garden"}
        panel={Panel.SavedGardens}
        title={t("Add Garden")}
        description={Content.SAVED_GARDENS}
        backTo={"/app/designer/gardens"} />
      <DesignerPanelContent panelName={"saved-garden"}>
        <Row>
          <GardenSnapshot
            currentSavedGarden={this.props.currentSavedGarden}
            plantTemplates={this.props.plantTemplates}
            dispatch={this.props.dispatch} />
        </Row>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddGarden = connect(mapStateToProps)(RawAddGarden);
