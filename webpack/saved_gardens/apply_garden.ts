import axios from "axios";
import { API } from "../api";

export const applyGarden = (gardenId: number) => axios
  .patch<void>(API.current.applyGardenPath(gardenId))
  .then(() => { });
