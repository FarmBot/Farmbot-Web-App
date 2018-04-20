import axios from "axios";
import { API } from "../api";

export const snapshotGarden = () => axios
  .post<void>(API.current.snapshotPath)
  .then(() => { });
