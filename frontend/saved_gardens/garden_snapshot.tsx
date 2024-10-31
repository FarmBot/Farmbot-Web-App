import React from "react";
import { snapshotGarden, newSavedGarden, copySavedGarden } from "./actions";
import { TaggedPlantTemplate, TaggedSavedGarden } from "farmbot";
import { t } from "../i18next_wrapper";
import { useNavigate } from "react-router-dom";

export interface GardenSnapshotProps {
  currentSavedGarden: TaggedSavedGarden | undefined;
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
}

/** New SavedGarden name input and snapshot/create buttons. */
export const GardenSnapshot = (props: GardenSnapshotProps) => {
  const [gardenName, setGardenName] = React.useState("");
  const [gardenNotes, setGardenNotes] = React.useState("");
  const navigate = useNavigate();

  const snapshot = () => {
    const { currentSavedGarden, plantTemplates } = props;
    !currentSavedGarden
      ? snapshotGarden(navigate, gardenName, gardenNotes)
      : props.dispatch(copySavedGarden({
        navigate,
        newSGName: gardenName,
        savedGarden: currentSavedGarden,
        plantTemplates
      }));
    setGardenName("");
    setGardenNotes("");
  };

  const newGarden = () => {
    props.dispatch(newSavedGarden(
      navigate,
      gardenName,
      gardenNotes,
    ));
    setGardenName("");
    setGardenNotes("");
  };

  return <div className="garden-snapshot">
    <label>{t("name")}</label>
    <input name="gardenName"
      onChange={e => setGardenName(e.currentTarget.value)}
      value={gardenName} />
    <label>{t("notes")}</label>
    <textarea name="notes"
      onChange={e => setGardenNotes(e.currentTarget.value)}
      value={gardenNotes} />
    <button
      className={"fb-button gray wide"}
      title={t("Snapshot current garden")}
      onClick={snapshot}>
      {t("Snapshot current garden")}
    </button>
    <button
      className="fb-button green wide"
      title={t("Add new garden")}
      onClick={newGarden}>
      {t("Add new garden")}
    </button>
  </div>;
};
