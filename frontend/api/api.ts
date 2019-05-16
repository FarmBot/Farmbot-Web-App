type ProtocolString = "http:" | "https:";
let current: API | undefined;
/** Record of all the relevant stuff in a string URL, except without all the
 *  stringly typed nonsense. */
interface UrlInfo {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  host: string;
}

/** Store all API endpoints in one place for the sake of DRYness.
 * API.current is probably the instance you want to use. */
export class API {
  /** Guesses the most appropriate API port based on a number of environment
   *  factors such as hostname and protocol (HTTP vs. HTTPS). */
  static inferPort(location = window.location): string {

    // ATTEMPT 1: Most devs run a server on localhost with the API on port 3000.
    if (location.port === "3808") { return "3000"; }

    // ATTEMPT 2: If they provide an explicit port (as in ://localhost:3000)
    //            use that port.
    if (location.port) { return location.port; }

    // ATTEMPT 3:  If that doesn't work, check for HTTPS:// and use the
    //             default of 443.
    if (API.parseURL(location.origin).protocol === "https:") {
      return "443";
    }

    // All others just use port 80.
    return "80";
  }

  static fetchBrowserLocation() {
    return `//${window.location.hostname}:${API.inferPort()}`;
  }

  static fetchHostName() {
    // Figured we could centralize this in case we change the method.
    return window.location.hostname;
  }

  static parseURL(url: string): UrlInfo {
    // Such an amazing hack!
    const info = document.createElement("a");
    info.href = url;
    return info;
  }

  static setBaseUrl(base: string) {
    current = new API(base);
  }

  /** The base URL can't be known until the user is logged in.
   * API.current will give URLs is the base URL is known and throw an
   * exception otherwise.
   */
  static get current(): API {
    if (current) {
      return current;
    } else {
      throw new Error(`
            Tried to access API before URL was resolved.
            Call API.setBaseUrl() before using API.current .`);
    }
  }

  /** "https:" or "http:". NO "//"! */
  private readonly protocol: ProtocolString;
  /** "example.com:3000" */
  private readonly host: string;

  constructor(input: string) {
    const url = API.parseURL(input);
    this.protocol = url.protocol as ProtocolString;
    this.host = url.host;
  }

  /** http://localhost:3000 */
  get baseUrl() { return `${this.protocol}//${this.host}`; }
  /** /api/tokens/ */
  get tokensPath() { return `${this.baseUrl}/api/tokens/`; }
  /** /api/password_resets/ */
  get passwordResetPath() { return `${this.baseUrl}/api/password_resets/`; }
  /** /api/device/ */
  get devicePath() { return `${this.baseUrl}/api/device/`; }
  /** /api/device/seed */
  get accountSeedPath() { return `${this.devicePath}seed`; }
  /** /api/device/reset */
  get accountResetPath() { return `${this.devicePath}reset`; }
  /** /api/users/ */
  get usersPath() { return `${this.baseUrl}/api/users/`; }
  /** /api/users/control_certificate */
  get transferCertPath() {
    return `${this.baseUrl}/api/users/control_certificate`;
  }
  /** /api/users/resend_verification */
  get userResendConfirmationPath() {
    return this.usersPath + "/resend_verification";
  }
  /** /api/peripherals/ */
  get peripheralsPath() { return `${this.baseUrl}/api/peripherals/`; }
  /** /api/farm_events/ */
  get farmEventsPath() { return `${this.baseUrl}/api/farm_events/`; }
  /** /api/regimens/ */
  get regimensPath() { return `${this.baseUrl}/api/regimens/`; }
  /** /api/sequences/ */
  get sequencesPath() { return `${this.baseUrl}/api/sequences/`; }
  /** /api/tools/ */
  get toolsPath() { return `${this.baseUrl}/api/tools/`; }
  /** /api/images/ */
  get imagesPath() { return `${this.baseUrl}/api/images/`; }
  /** /api/points/ */
  get pointsPath() { return `${this.baseUrl}/api/points/`; }
  /** /api/points/?filter=all */
  get allPointsPath() { return `${this.pointsPath}?filter=all`; }
  /** /api/points/search */
  get pointSearchPath() { return `${this.pointsPath}search`; }
  /** Rather than returning ALL logs, returns a filtered subset.
   * /api/logs/search */
  get filteredLogsPath() { return `${this.baseUrl}/api/logs/search`; }
  /** /api/webcam_feed */
  get webcamFeedPath() { return `${this.baseUrl}/api/webcam_feeds/`; }
  /** /api/web_app_config */
  get webAppConfigPath() { return `${this.baseUrl}/api/web_app_config/`; }
  /** /api/fbos_config */
  get fbosConfigPath() { return `${this.baseUrl}/api/fbos_config/`; }
  /** /api/firmware_config */
  get firmwareConfigPath() { return `${this.baseUrl}/api/firmware_config/`; }
  /** /api/sensor_readings */
  get sensorReadingPath() { return `${this.baseUrl}/api/sensor_readings`; }
  /** /api/sensors/ */
  get sensorPath() { return `${this.baseUrl}/api/sensors/`; }
  /** /api/farmware_envs/:id */
  get farmwareEnvPath() { return `${this.baseUrl}/api/farmware_envs/`; }
  /** /api/pin_bindings/:id */
  get pinBindingPath() { return `${this.baseUrl}/api/pin_bindings/`; }
  /** /api/saved_gardens/:id */
  get savedGardensPath() { return `${this.baseUrl}/api/saved_gardens/`; }
  /** /api/saved_gardens/snapshot */
  get snapshotPath() { return this.savedGardensPath + "/snapshot"; }
  /** /api/saved_gardens/:id/apply */
  applyGardenPath =
    (gardenId: number) => `${this.savedGardensPath}/${gardenId}/apply`;
  get exportDataPath() { return `${this.baseUrl}/api/export_data`; }
  /** /api/plant_templates/:id */
  get plantTemplatePath() { return `${this.baseUrl}/api/plant_templates/`; }
  /** /api/diagnostic_dumps/:id */
  get diagnosticDumpsPath() { return `${this.baseUrl}/api/diagnostic_dumps/`; }
  /** /api/farmware_installations/:id */
  get farmwareInstallationPath() {
    return `${this.baseUrl}/api/farmware_installations/`;
  }
  /** /api/alerts/:id */
  get alertPath() { return `${this.baseUrl}/api/alerts/`; }
  /** /api/global_bulletins/:id */
  get globalBulletinPath() { return `${this.baseUrl}/api/global_bulletins/`; }
  get syncPatch() { return `${this.baseUrl}/api/device/sync/`; }
}
