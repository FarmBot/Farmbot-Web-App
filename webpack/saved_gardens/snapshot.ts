import axios from "axios";
import { API } from "../api";

export function snapshotGarden() {
  return axios.post<void>(API.current.snapshotPath).then(() => { });
}
