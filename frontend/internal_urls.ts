import { isUndefined, kebabCase, last } from "lodash";
import { t } from "./i18next_wrapper";

export namespace Path {
  const appended = (path: string | number | undefined) => path ? "/" + path : "";
  const highlight = (path: string | undefined) => path ? "?highlight=" + path : "";
  const page = (path: string | undefined) => path ? "?page=" + path : "";
  export const getPathArray = () => window.location.pathname.split("/");

  export const startsWith = (path: string) =>
    getPathArray().join("/").startsWith(withApp(path));
  export const equals = (path: string) =>
    getPathArray().join("/") == withApp(path);
  export const getLastChunk = () => last(getPathArray()) || "";
  export const lastChunkEquals = (chunk: string) => chunk == getLastChunk();
  export const lastChunkIsNum = (): boolean => !isNaN(parseInt(getLastChunk()));

  export const withApp = (path: string) =>
    path.startsWith("/app") ? path : "/app" + path;
  export const mock = withApp;

  export const app = (path?: string) => withApp("") + appended(path);

  export const designer = (path?: string) => app("designer") + appended(path);
  export const logs = (path?: string) => app("logs") + appended(path);

  export const plants = (path?: string | number) =>
    designer("plants") + appended(path);
  export const cropSearch = (path?: string) =>
    plants("crop_search") + appended(path);
  export const weeds = (path?: string | number) =>
    designer("weeds") + appended(path);
  export const points = (path?: string | number) =>
    designer("points") + appended(path);
  export const groups = (path?: string | number) =>
    designer("groups") + appended(path);
  export const savedGardens = (path?: string | number) =>
    designer("gardens") + appended(path);
  export const plantTemplates = (path?: string | number) =>
    savedGardens("templates") + appended(path);
  export const regimens = (path?: string) =>
    designer("regimens") + appended(path);
  export const farmEvents = (path?: string | number) =>
    designer("events") + appended(path);
  export const sensors = (path?: string | number) =>
    designer("sensors") + appended(path);
  export const zones = (path?: string | number) =>
    designer("zones") + appended(path);
  export const farmware = (path?: string) =>
    designer("farmware") + appended(path);
  export const tools = (path?: string | number) =>
    designer("tools") + appended(path);
  export const toolSlots = (path?: string | number) =>
    designer("tool-slots") + appended(path);
  export const curves = (path?: string | number) =>
    designer("curves") + appended(path);

  export const messages = () => designer("messages");
  export const controls = () => designer("controls");
  export const support = () => designer("support");
  export const setup = () => designer("setup");
  export const tours = () => designer("tours");

  export const designerSequences = (path?: string) =>
    designer("sequences") + appended(path);
  export const sequencePage = (path?: string) =>
    app("sequences") + appended(path);
  export const inDesigner = () => Path.getSlug(Path.app()) == "designer";
  export const sequences = (path?: string) =>
    inDesigner() ? Path.designerSequences(path) : Path.sequencePage(path);

  export const settings = (path?: string) => designer("settings") + highlight(path);
  export const photos = (path?: string) => designer("photos") + highlight(path);

  export const help = (path?: string) => designer("help") + page(path);
  export const developer = (path?: string) => designer("developer") + page(path);

  export const sequenceVersion = (path?: string | number | undefined) =>
    app("shared/sequence") + appended(path);

  export const location =
    (props?: { x?: number, y?: number, z?: number }): string => {
      if (!props || isUndefined(props.x) || isUndefined(props.y)) {
        return Path.designer("location");
      }
      const { x, y, z } = props;
      return isUndefined(z)
        ? Path.designer(`location?x=${x}&y=${y}`)
        : Path.designer(`location?x=${x}&y=${y}&z=${z}`);
    };

  export const idIndex = (path: string) => path.split("/").length + 0;
  export const getSlug = (path: string): string =>
    getPathArray()[Path.idIndex(path)] || "";
  export const getCropSlug = () => kebabCase(Path.getSlug(Path.cropSearch()));
}

export namespace FilePath {
  const resource = (path: string) => "/app-resources/" + path;
  export const language = (lang: string) => `${resource("languages")}/${lang}.json`;
  const images = (path: string) => resource("img") + "/" + path;
  export const image = (img: string, ext = "svg") => `${images(img)}.${ext}`;
  export const setupWizardImage = (img: string) => images(`setup_wizard/${img}`);
  export const icon = (icon: Icon) => `${images("icons")}/${icon}.svg`;
  export const bug = (bug?: Bug) =>
    bug ? `${images("bugs")}/${bug}.svg` : images("bugs");
  export const emptyState = (bug: string) => `${images("empty_state")}/${bug}.png`;
  export const DEFAULT_ICON = image("generic-plant");
  export const DEFAULT_WEED_ICON = image("generic-weed");
  export const THREE_D_GARDEN_LOADING = "/promo_loading_image.avif";
}

export enum Icon {
  map = "map",
  plant = "plant",
  weeds = "weeds",
  point = "point",
  groups = "groups",
  curves = "curves",
  sequence = "sequence",
  regimens = "regimen",
  gardens = "gardens",
  calendar = "calendar",
  zones = "zones",
  controls = "controls",
  sensors = "sensors",
  photos = "photos",
  farmware = "farmware",
  tool = "tool",
  messages = "messages",
  logs = "logs",
  help = "help",
  documentation = "documentation",
  support = "support",
  settings = "settings",
  shop = "shop",
  developer = "developer",
  logout = "logout",
  settings_small = "settings_small",
}

export enum Bug {
  "aphid" = "aphid",
  "caterpillar" = "caterpillar",
  "earth-worm" = "earth-worm",
  "generic-ant" = "generic-ant",
  "generic-moth" = "generic-moth",
  "june-bug" = "june-bug",
  "ladybug" = "ladybug",
  "roly-poly" = "roly-poly",
}

export const BUGS = [
  Bug.aphid,
  Bug.caterpillar,
  Bug["earth-worm"],
  Bug["generic-ant"],
  Bug["generic-moth"],
  Bug["june-bug"],
  Bug.ladybug,
  Bug["roly-poly"],
];

export const PAGE_SLUGS = (): { [x: string]: string } => ({
  "map": t("Map"),
  "plants": t("Plants"),
  "weeds": t("Weeds"),
  "points": t("Points"),
  "curves": t("Curves"),
  "sequences": t("Sequences"),
  "regimens": t("Regimens"),
  "events": t("Events"),
  "sensors": t("Sensors"),
  "photos": t("Photos"),
  "tools": t("Tools"),
  "messages": t("Messages"),
  "help": t("Help"),
  "settings": t("Settings"),
  "tours": t("Tours"),
});

export const landingPagePath = (page: string) => {
  switch (page) {
    case "map": return Path.designer();
    case "logs": return Path.logs();
    default: return Path.designer(page);
  }
};
