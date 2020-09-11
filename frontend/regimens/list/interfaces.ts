import { TaggedRegimen } from "farmbot";
import { UUID } from "../../resources/interfaces";

export interface RegimensListProps {
  dispatch: Function;
  regimens: TaggedRegimen[];
  regimenUsageStats: Record<UUID, boolean | undefined>;
}

export interface RegimensListState {
  searchTerm: string;
}
