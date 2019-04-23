import axios from "axios";
import { API } from "../api";
import { Bulletin } from "./interfaces";

const url = (slug: string) => `${API.current.globalBulletinPath}${slug}`;

export const fetchBulletinContent =
  (slug: string): Promise<Bulletin | undefined> => {
    return axios
      .get<Bulletin>(url(slug))
      .then(response => Promise.resolve(response.data));
  };
