import React from "react";
import { GardenViewButtonProps, EditGardenProps } from "./interfaces";
import { openOrCloseGarden, applyGarden, destroySavedGarden } from "./actions";
import { error } from "../toast/toast";
import { trim } from "../util";
import { BlurableInput } from "../ui";
import { edit, save } from "../api/crud";
import { connect } from "react-redux";
import {
  selectAllPlantPointers, maybeFindSavedGardenById, selectAllPlantTemplates,
} from "../resources/selectors";
import { Everything } from "../interfaces";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { isNumber, take } from "lodash";
import { ResourceIndex } from "../resources/interfaces";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { Path } from "../internal_urls";
import { PointGroupItem } from "../point_groups/point_group_item";
import {
  calcMaxCount, MoreIndicatorIcon,
} from "../point_groups/criteria/component";
import { Navigate, NavigateFunction, useNavigate } from "react-router";

/** Open or close a SavedGarden. */
const GardenViewButton = (props: GardenViewButtonProps) => {
  const { navigate, dispatch, savedGardenId, gardenIsOpen } = props;
  const onClick = openOrCloseGarden({
    navigate,
    savedGardenId,
    gardenIsOpen,
    dispatch,
  });
  const btnText = gardenIsOpen
    ? t("exit")
    : t("view");
  return <button
    className={`fb-button ${gardenIsOpen ? "gray" : "yellow"}`}
    title={btnText}
    onClick={onClick}>
    {btnText}
  </button>;
};

/** Apply a SavedGarden after checking that the current garden is empty. */
const ApplyGardenButton =
  (props: {
    plantPointerCount: number,
    gardenId: number,
    dispatch: Function,
    navigate: NavigateFunction,
  }) =>
    <button
      className="fb-button green"
      title={t("apply garden")}
      onClick={() => props.plantPointerCount > 0
        ? error(trim(`${t("Please clear current garden first.")}
        (${props.plantPointerCount} ${t("plants")})`))
        : props.dispatch(applyGarden(props.navigate, props.gardenId))}>
      {t("apply")}
    </button>;

const DestroyGardenButton =
  (props: {
    navigate: NavigateFunction,
    dispatch: Function,
    gardenUuid: string,
  }) =>
    <i className={"fa fa-trash fb-icon-button invert"}
      title={t("delete garden")}
      onClick={() => props.dispatch(destroySavedGarden(
        props.navigate, props.gardenUuid))} />;

const findSavedGardenByUrl = (ri: ResourceIndex) => {
  const id = Path.getSlug(Path.savedGardens());
  const num = parseInt(id, 10);
  if (isNumber(num) && !isNaN(num)) {
    return maybeFindSavedGardenById(ri, num);
  }
};

export const mapStateToProps = (props: Everything): EditGardenProps => {
  const { openedSavedGarden } = props.resources.consumers.farm_designer;
  const savedGarden = findSavedGardenByUrl(props.resources.index);
  return {
    savedGarden,
    gardenIsOpen: !!(savedGarden?.body.id === openedSavedGarden),
    dispatch: props.dispatch,
    plantPointerCount: selectAllPlantPointers(props.resources.index).length,
    gardenPlants: selectAllPlantTemplates(props.resources.index)
      .filter(p => p.body.saved_garden_id == savedGarden?.body.id),
  };
};

export const RawEditGarden = (props: EditGardenProps) => {
  const navigate = useNavigate();
  const [notes, setNotes] = React.useState(props.savedGarden?.body.notes || "");
  const [expand, setExpand] = React.useState(false);

  const toggleExpand = () => setExpand(!expand);

  const { savedGarden } = props;
  const gardensPath = Path.savedGardens();
  const plantsPath = Path.plants();
  const maxCount = expand ? 1000 : calcMaxCount(3);
  return <DesignerPanel panelName={"saved-garden-edit"}
    panel={Panel.SavedGardens}>
    {!savedGarden && Path.startsWith(gardensPath) && <Navigate to={plantsPath} />}
    <DesignerPanelHeader
      panelName={"saved-garden"}
      panel={Panel.SavedGardens}
      title={t("Edit garden")}
      backTo={plantsPath}>
      {savedGarden &&
        <div className={"buttons"}>
          <ApplyGardenButton
            navigate={navigate}
            dispatch={props.dispatch}
            plantPointerCount={props.plantPointerCount}
            gardenId={savedGarden.body.id || -1} />
          <DestroyGardenButton
            navigate={navigate}
            dispatch={props.dispatch}
            gardenUuid={savedGarden.uuid} />
          <GardenViewButton
            navigate={navigate}
            dispatch={props.dispatch}
            savedGardenId={savedGarden.body.id}
            gardenIsOpen={props.gardenIsOpen} />
        </div>}
    </DesignerPanelHeader>
    <DesignerPanelContent panelName={"saved-garden-edit"}>
      {savedGarden
        ? <div className={"grid saved-garden-grid"}>
          <label>{t("name")}</label>
          <BlurableInput
            value={savedGarden.body.name || ""}
            onCommit={e => {
              props.dispatch(edit(savedGarden, {
                name: e.currentTarget.value
              }));
              props.dispatch(save(savedGarden.uuid));
            }} />
          <label>{t("notes")}</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.currentTarget.value)}
            onBlur={() => {
              props.dispatch(edit(savedGarden, {
                notes: notes
              }));
              props.dispatch(save(savedGarden.uuid));
            }} />
          <label>{t("plants")}</label>
          <div className={"point-list-wrapper"}>
            {take(props.gardenPlants, maxCount).map(point =>
              <PointGroupItem key={point.uuid} point={point} />)}
            <MoreIndicatorIcon count={props.gardenPlants.length}
              maxCount={maxCount} onClick={toggleExpand} />
          </div>
        </div>
        : <p>{t("Garden not found.")}</p>}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const EditGarden = connect(mapStateToProps)(RawEditGarden);
// eslint-disable-next-line import/no-default-export
export default EditGarden;
