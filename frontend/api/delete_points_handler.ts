import { betterCompact } from "../util";
import { t } from "../i18next_wrapper";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { deletePointsByIds } from "./delete_points";

export const deleteAllIds = (
  pointName: string,
  points: (TaggedGenericPointer | TaggedWeedPointer)[],
) =>
  (event: React.MouseEvent<HTMLElement>) => {
    const ids = betterCompact(points.map(p => p.body.id));
    event.stopPropagation();
    confirm(t("Delete all {{ count }} {{points}} in section?",
      { count: ids.length, points: pointName })) &&
      deletePointsByIds(pointName, ids);
  };
