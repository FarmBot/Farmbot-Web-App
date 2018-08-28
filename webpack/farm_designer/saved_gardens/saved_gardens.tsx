import * as React from "react";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { history } from "../../history";
import { unselectPlant } from "../actions";
import { snapshotGarden } from "../saved_gardens/snapshot";
import {
  selectAllSavedGardens, selectAllPlantTemplates, selectAllPlantPointers
} from "../../resources/selectors";
import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";
import { applyGarden } from "./apply_garden";
import { destroy } from "../../api/crud";
import { Row, Col } from "../../ui";
import { error } from "farmbot-toastr";

export interface GardenSnapshotProps {
  plantsInGarden: boolean;
}

interface GardenSnapshotState {
  name: string | undefined;
}

export class GardenSnapshot
  extends React.Component<GardenSnapshotProps, GardenSnapshotState> {
  state = { name: undefined };

  render() {
    return <div>
      <label>{t("garden name")}</label>
      <input
        onChange={e => this.setState({ name: e.currentTarget.value })}
        value={this.state.name} />
      <button
        className="fb-button gray wide"
        onClick={() => this.props.plantsInGarden
          ? snapshotGarden(this.state.name)
          : error(t("No plants in garden. Create some plants first."))}>
        {t("Snapshot")}
      </button>
    </div>;
  }
}

const SavedGardenList = ({
  savedGardens, plantTemplates, dispatch, plantsInGarden
}: SavedGardensProps) =>
  <div>
    <Row>
      <Col xs={5}>
        <label>{t("name")}</label>
      </Col>
      <Col xs={2}>
        <label>{t("plants")}</label>
      </Col>
    </Row>
    {savedGardens.map(sg => {
      const gardenId = sg.body.id;
      const plantCount = plantTemplates.filter(pt =>
        pt.body.saved_garden_id === gardenId).length;
      if (gardenId) {
        return <Row key={sg.uuid}>
          <Col xs={5}>
            <p>{sg.body.name}</p>
          </Col>
          <Col xs={2}>
            <p>{plantCount}</p>
          </Col>
          <Col xs={5}>
            <button
              className="fb-button green"
              onClick={() => plantsInGarden
                ? error(t("Please clear current garden first."))
                : applyGarden(gardenId)}>
              {t("apply")}
            </button>
            <button
              className="fb-button red"
              onClick={() => dispatch(destroy(sg.uuid))}>
              <i className="fa fa-times" />
            </button>
          </Col>
        </Row>;
      }
    })}
  </div>;

export function mapStateToProps(props: Everything) {
  return {
    savedGardens: selectAllSavedGardens(props.resources.index),
    plantTemplates: selectAllPlantTemplates(props.resources.index),
    dispatch: props.dispatch,
    plantsInGarden: selectAllPlantPointers(props.resources.index).length > 0,
  };
}

export interface SavedGardensProps {
  savedGardens: TaggedSavedGarden[];
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
  plantsInGarden: boolean;
}

@connect(mapStateToProps)
export class SavedGardens extends React.Component<SavedGardensProps, {}> {

  componentDidMount() {
    unselectPlant(this.props.dispatch)();
  }

  render() {
    return <div
      className="panel-container green-panel saved-garden-panel">
      <div className="panel-header green-panel">
        <p className="panel-title">
          <i className="fa fa-arrow-left plant-panel-back-arrow"
            onClick={() => history.push("/app/designer/plants")} />
          {t("Saved Gardens")}
        </p>

        <div className="panel-header-description">
          {t("Save or load a garden.")}
        </div>
      </div>

      <div className="panel-content saved-garden-panel-content">
        <GardenSnapshot plantsInGarden={this.props.plantsInGarden} />
        <hr />
        {this.props.savedGardens.length > 0
          ? <SavedGardenList {...this.props} />
          : <p>{t("No saved gardens yet.")}</p>}
      </div>
    </div>;
  }
}

export const SavedGardensLink = () =>
  <button className="fb-button green"
    hidden={!(localStorage.getItem("FUTURE_FEATURES"))}
    onClick={() => history.push("/app/designer/plants/saved_gardens")}>
    {t("Saved Gardens")}
  </button>;
