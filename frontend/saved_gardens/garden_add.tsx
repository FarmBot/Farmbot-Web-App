import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { GardenSnapshotProps, GardenSnapshot } from "./garden_snapshot";
import {
  selectAllPlantTemplates, maybeFindSavedGardenById,
} from "../resources/selectors";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Content } from "../constants";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { Path } from "../internal_urls";

export const mapStateToProps = (props: Everything): GardenSnapshotProps => {
  const { openedSavedGarden } = props.resources.consumers.farm_designer;
  return {
    currentSavedGarden: openedSavedGarden
      ? maybeFindSavedGardenById(props.resources.index, openedSavedGarden)
      : undefined,
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
        title={t("Add garden")}
        description={Content.SAVED_GARDENS}
        backTo={Path.plants()} />
      <DesignerPanelContent panelName={"saved-garden"}>
        <GardenSnapshot
          currentSavedGarden={this.props.currentSavedGarden}
          plantTemplates={this.props.plantTemplates}
          dispatch={this.props.dispatch} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddGarden = connect(mapStateToProps)(RawAddGarden);
// eslint-disable-next-line import/no-default-export
export default AddGarden;
