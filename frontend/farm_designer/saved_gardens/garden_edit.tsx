import * as React from "react";
import { GardenViewButtonProps, EditGardenProps } from "./interfaces";
import { openOrCloseGarden, applyGarden, destroySavedGarden } from "./actions";
import { error } from "../../toast/toast";
import { trim } from "../../util";
import { BlurableInput, Row } from "../../ui";
import { edit, save } from "../../api/crud";
import { connect } from "react-redux";
import {
  selectAllPlantPointers, maybeFindSavedGardenById
} from "../../resources/selectors";
import { Everything } from "../../interfaces";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../designer_panel";
import { getPathArray } from "../../history";
import { isNumber } from "lodash";
import { ResourceIndex } from "../../resources/interfaces";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";

/** Open or close a SavedGarden. */
const GardenViewButton = (props: GardenViewButtonProps) => {
  const { dispatch, savedGarden, gardenIsOpen } = props;
  const onClick = openOrCloseGarden({ savedGarden, gardenIsOpen, dispatch });
  const btnText = gardenIsOpen
    ? t("exit")
    : t("view");
  return <button
    className={`fb-button ${gardenIsOpen ? "gray" : "yellow"}`}
    onClick={onClick}>
    {btnText}
  </button>;
};

/** Apply a SavedGarden after checking that the current garden is empty. */
const ApplyGardenButton =
  (props: { plantPointerCount: number, gardenId: number, dispatch: Function }) =>
    <button
      className="fb-button green"
      onClick={() => props.plantPointerCount > 0
        ? error(trim(`${t("Please clear current garden first.")}
        (${props.plantPointerCount} ${t("plants")})`))
        : props.dispatch(applyGarden(props.gardenId))}>
      {t("apply")}
    </button>;

const DestroyGardenButton =
  (props: { dispatch: Function, gardenUuid: string }) =>
    <button
      className="fb-button red"
      onClick={() => props.dispatch(destroySavedGarden(props.gardenUuid))}>
      {t("delete")}
    </button>;

export const findSavedGardenByUrl = (ri: ResourceIndex) => {
  const id = getPathArray()[4];
  const num = parseInt(id || "NOPE", 10);
  if (isNumber(num) && !isNaN(num)) {
    return maybeFindSavedGardenById(ri, num);
  }
};

export const mapStateToProps = (props: Everything): EditGardenProps => {
  const { openedSavedGarden } = props.resources.consumers.farm_designer;
  const savedGarden = findSavedGardenByUrl(props.resources.index);
  return {
    savedGarden,
    gardenIsOpen: !!(savedGarden?.uuid === openedSavedGarden),
    dispatch: props.dispatch,
    plantPointerCount: selectAllPlantPointers(props.resources.index).length,
  };
};

export class RawEditGarden extends React.Component<EditGardenProps, {}> {
  render() {
    const { savedGarden } = this.props;
    return <DesignerPanel panelName={"saved-garden-edit"}
      panel={Panel.SavedGardens}>
      <DesignerPanelHeader
        panelName={"saved-garden"}
        panel={Panel.SavedGardens}
        title={t("Edit garden")}
        backTo={"/app/designer/gardens"} />
      <DesignerPanelContent panelName={"saved-garden-edit"}>
        {savedGarden
          ? <div>
            <Row>
              <label>{t("name")}</label>
              <BlurableInput
                value={savedGarden.body.name || ""}
                onCommit={e => {
                  this.props.dispatch(edit(savedGarden, {
                    name: e.currentTarget.value
                  }));
                  this.props.dispatch(save(savedGarden.uuid));
                }} />
            </Row>
            <Row>
              <ApplyGardenButton
                dispatch={this.props.dispatch}
                plantPointerCount={this.props.plantPointerCount}
                gardenId={savedGarden.body.id || -1} />
              <DestroyGardenButton
                dispatch={this.props.dispatch}
                gardenUuid={savedGarden.uuid} />
              <GardenViewButton
                dispatch={this.props.dispatch}
                savedGarden={savedGarden.uuid}
                gardenIsOpen={this.props.gardenIsOpen} />
            </Row>
          </div>
          : <p>{t("Garden not found.")}</p>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditGarden = connect(mapStateToProps)(RawEditGarden);
