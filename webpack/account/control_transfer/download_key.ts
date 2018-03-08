import axios from "axios";
import { API } from "../../api/index";

/** Downloads a public key  */
export async function downloadKey(): Promise<string> {
  const { data } = await axios.get<string>(API.current.publicKeyPath);
  return data;
}
