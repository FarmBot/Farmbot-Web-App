import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../resource_index_builder";

export let resources: Everything["resources"] = buildResourceIndex();
