import axios from "axios";
import { API } from "../api";
import { Bulletin } from "./interfaces";
import { DropDownItem } from "../ui";
import { UnsafeError } from "../interfaces";
import { toastErrors } from "../toast_errors";
import { info } from "farmbot-toastr";
import { t } from "../i18next_wrapper";

const url = (slug: string) => `${API.current.globalBulletinPath}${slug}`;

export const fetchBulletinContent =
  (slug: string): Promise<Bulletin | undefined> => {
    return axios
      .get<Bulletin>(url(slug))
      .then(response => Promise.resolve(response.data));
  };

export const seedAccount = (onClick: () => void) => (ddi: DropDownItem) =>
  axios.post(API.current.accountSeedPath, { product_line: ddi.value })
    .then(() => {
      info(t("Seeding in progress."), "Busy");
      onClick();
    }, (err: UnsafeError) => toastErrors({ err }));
