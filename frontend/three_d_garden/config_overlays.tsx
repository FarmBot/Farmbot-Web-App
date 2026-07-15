import React from "react";
import {
  ConfigWithPosition, getSeasonProperties, INITIAL, modifyConfig,
} from "./config";
import { setUrlParam } from "./zoom_beacons_constants";
import { ExternalUrl } from "../external_urls";
import { FocusVisibilityDiv } from "./focus_transition";
import { SEASON_TIMINGS } from "../promo/constants";
import { clearCameraUrlParams } from "./camera";
import { getSeasonAnimationElapsedAtSunPosition } from "./garden/sun";

export interface ToolTip {
  timeoutId: number;
  text: string;
}

export interface OverlayProps {
  config: ConfigWithPosition;
  setConfig(config: ConfigWithPosition): void;
  toolTip: ToolTip;
  setToolTip(tooltip: ToolTip): void;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  publicContentVisible?: boolean;
  loadComplete?: boolean;
  startTimeRef?: React.RefObject<number>;
  seasonAnimationElapsedRef?: React.RefObject<number | undefined>;
  seasonAnimationPaused?: boolean;
  setSeasonAnimationPaused?(paused: boolean): void;
  onSeasonSelect?(): void;
}

interface SectionProps {
  title: string;
  configKey: keyof ConfigWithPosition;
  options: Record<string, string>;
  config: ConfigWithPosition;
  setConfig(config: ConfigWithPosition): void;
  toolTip: ToolTip;
  setToolTip(tooltip: ToolTip): void;
  startTimeRef?: React.RefObject<number>;
  seasonAnimationElapsedRef?: React.RefObject<number | undefined>;
  seasonAnimationPaused?: boolean;
  setSeasonAnimationPaused?(paused: boolean): void;
  onSeasonSelect?(): void;
  showAnimationControl?: boolean;
}

interface SeasonProgressStyle extends React.CSSProperties {
  "--season-duration"?: string;
  "--season-animation-delay"?: string;
  "--season-progress"?: string;
}

const seasonTiming = (season: string) =>
  SEASON_TIMINGS.find(timing => timing.season == season);

interface SeasonAnimationClock {
  elapsedSeconds: number;
  startedAt: number;
}

export const setSeasonAnimationRunning = (
  running: boolean,
  startTimeRef?: React.RefObject<number>,
  seasonAnimationElapsedRef?: React.RefObject<number | undefined>,
): SeasonAnimationClock | undefined => {
  if (!startTimeRef) { return undefined; }
  const now = performance.now() / 1000;
  const elapsedSeconds = seasonAnimationElapsedRef?.current
    ?? (startTimeRef.current < 0
      ? -startTimeRef.current
      : Math.max(now - startTimeRef.current, 0));
  const startedAt = now - elapsedSeconds;
  startTimeRef.current = running ? startedAt : -elapsedSeconds;
  if (seasonAnimationElapsedRef) {
    seasonAnimationElapsedRef.current = running ? undefined : elapsedSeconds;
  }
  return { elapsedSeconds, startedAt };
};

const seasonProgressStyle = (
  season: string,
  startedAt: number,
): SeasonProgressStyle | undefined => {
  const timing = seasonTiming(season);
  if (!timing) { return undefined; }
  const totalSeconds = timing.duration + timing.pause;
  const elapsedSeconds = Math.min(
    Math.max(performance.now() / 1000 - startedAt, 0),
    totalSeconds,
  );
  const progress = elapsedSeconds / totalSeconds * 100;
  return {
    "--season-duration": `${totalSeconds}s`,
    "--season-animation-delay": `${-elapsedSeconds}s`,
    "--season-progress": `${progress}%`,
  };
};

const PublicOverlaySection = (props: SectionProps) => {
  const {
    title, configKey, options, config, setConfig, toolTip, setToolTip,
    startTimeRef, seasonAnimationPaused, setSeasonAnimationPaused,
    onSeasonSelect, seasonAnimationElapsedRef: elapsedRefProp,
    showAnimationControl,
  } = props;
  const localElapsedRef = React.useRef<number | undefined>(undefined);
  const seasonAnimationElapsedRef = elapsedRefProp || localElapsedRef;
  const [seasonAnimationStartedAt, setSeasonAnimationStartedAt] =
    React.useState(() => performance.now() / 1000);
  const clearToolTip = React.useCallback(() => {
    clearTimeout(toolTip.timeoutId);
    setToolTip({ timeoutId: 0, text: "" });
  }, [setToolTip, toolTip.timeoutId]);
  const handleSeasonAnimationToggle = React.useCallback(() => {
    const running = !config.animateSeasons;
    const clock = setSeasonAnimationRunning(
      running,
      startTimeRef,
      seasonAnimationElapsedRef,
    );
    clock && setSeasonAnimationStartedAt(clock.startedAt);
    setSeasonAnimationPaused?.(!running);
    clearToolTip();
    setConfig(modifyConfig(config, {
      animateSeasons: running,
    }));
  }, [
    clearToolTip,
    config,
    setConfig,
    setSeasonAnimationPaused,
    seasonAnimationElapsedRef,
    startTimeRef,
  ]);
  const handleSeasonAnimationKeyDown =
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key != "Enter" && e.key != " ") { return; }
      e.preventDefault();
      handleSeasonAnimationToggle();
    };

  React.useEffect(() => {
    if (!showAnimationControl) { return; }
    const now = performance.now() / 1000;
    if (seasonAnimationPaused && startTimeRef && startTimeRef.current < 0) {
      setSeasonAnimationStartedAt(now + startTimeRef.current);
    } else if (config.animateSeasons) {
      setSeasonAnimationStartedAt(startTimeRef?.current || now);
    }
  }, [
    config.animateSeasons,
    config.plants,
    seasonAnimationPaused,
    showAnimationControl,
    startTimeRef,
  ]);

  return <div className={"setting-section"}>
    <div className="setting-title">{title}</div>
    <div className={"row"}>
      {Object.entries(options).map(([preset, label]) => {
        const active = label == config[configKey];
        const disabled = label == "Mobile"
          && config.sizePreset == "Genesis XL";
        const showSeasonProgress =
          !!(showAnimationControl
            && (config.animateSeasons || seasonAnimationPaused)
            && active);
        const className = [
          preset,
          active ? "active" : "",
          disabled ? "disabled" : "",
          showSeasonProgress ? "season-progress" : "",
          seasonAnimationPaused ? "season-progress-paused" : "",
        ].join(" ");
        const update = configKey == "plants"
          ? { [configKey]: label, animateSeasons: false }
          : { [configKey]: label };
        return <button key={preset} className={className}
          style={showSeasonProgress
            ? seasonProgressStyle(label, seasonAnimationStartedAt)
            : undefined}
          onClick={() => {
            clearTimeout(toolTip.timeoutId);
            if (disabled) {
              const text =
                "Mobile beds are not recommended for Genesis XL machines";
              const timeoutId = setTimeout(() =>
                setToolTip({ timeoutId: 0, text: "" }), 3000);
              setToolTip(({ timeoutId: timeoutId as unknown as number, text }));
              return;
            } else {
              setToolTip({ timeoutId: 0, text: "" });
            }
            if (configKey == "plants") {
              if (startTimeRef) {
                const nextConfig = modifyConfig(config, {
                  [configKey]: label,
                });
                const { sunInclination } = getSeasonProperties(
                  nextConfig,
                  "Summer",
                );
                const targetSunInclination =
                  nextConfig.sunInclination == INITIAL.sunInclination
                    ? sunInclination
                    : nextConfig.sunInclination;
                seasonAnimationElapsedRef.current =
                  getSeasonAnimationElapsedAtSunPosition(
                    label,
                    targetSunInclination,
                    nextConfig.sunAzimuth,
                  );
                startTimeRef.current = performance.now() / 1000;
              }
              setSeasonAnimationPaused?.(false);
              label != config[configKey] && onSeasonSelect?.();
            }
            setConfig(modifyConfig(config, update));
          }}>
          {label}
        </button>;
      })}
      {showAnimationControl &&
        <span
          className={[
            "season-animation-control",
            config.animateSeasons ? "active" : "",
          ].join(" ")}
          role={"button"}
          tabIndex={0}
          title={"animateSeasons"}
          aria-label={config.animateSeasons ? "Pause seasons" : "Play seasons"}
          onClick={handleSeasonAnimationToggle}
          onKeyDown={handleSeasonAnimationKeyDown}>
          <i className={`fa fa-${config.animateSeasons ? "pause" : "play"}`} />
        </span>}
    </div>
  </div>;
};

export const PublicOverlay = (props: OverlayProps) => {
  const {
    config, setConfig, toolTip, setToolTip,
    seasonAnimationPaused, setSeasonAnimationPaused,
  } = props;
  const commonSectionProps = {
    config,
    setConfig,
    toolTip,
    setToolTip,
    seasonAnimationPaused,
    seasonAnimationElapsedRef: props.seasonAnimationElapsedRef,
    setSeasonAnimationPaused,
    onSeasonSelect: props.onSeasonSelect,
  };
  const settingsBarClassName = [
    "settings-bar",
    props.loadComplete ? "settings-bar-loaded" : "",
  ].join(" ");
  const publicContentVisible = props.publicContentVisible
    ?? !props.activeFocus;

  return <div className={"overlay"}>
    {config.settingsBar &&
      <FocusVisibilityDiv
        className={settingsBarClassName}
        visible={publicContentVisible}>
        <div className={"settings-bar-content"}>
          <PublicOverlaySection
            {...commonSectionProps}
            title={"FarmBot"}
            configKey={"sizePreset"}
            options={{
              "genesis": "Genesis",
              "genesis-xl": "Genesis XL",
            }} />
          <PublicOverlaySection
            {...commonSectionProps}
            title={"Season"}
            configKey={"plants"}
            startTimeRef={props.startTimeRef}
            showAnimationControl={true}
            options={{
              "spring": "Spring",
              "summer": "Summer",
              "fall": "Fall",
              "winter": "Winter",
            }} />
          <PublicOverlaySection
            {...commonSectionProps}
            title={"Bed Type"}
            configKey={"bedType"}
            options={{
              "standard": "Standard",
              "mobile": "Mobile",
            }} />
          <PublicOverlaySection
            {...commonSectionProps}
            title={"Environment"}
            configKey={"scene"}
            options={{
              "outdoor": "Outdoor",
              "lab": "Lab",
              "greenhouse": "Greenhouse",
            }} />
        </div>
      </FocusVisibilityDiv>}
    <FocusVisibilityDiv
      className={"promo-info"}
      visible={config.promoInfo && publicContentVisible}>
      <PromoInfo
        isGenesis={config.sizePreset == "Genesis"}
        kitVersion={config.kitVersion} />
    </FocusVisibilityDiv>
  </div>;
};

interface PromoInfoProps {
  isGenesis: boolean;
  kitVersion: string;
}

const PromoInfo = (props: PromoInfoProps) => {
  const { isGenesis, kitVersion } = props;
  return <React.Fragment>
    <h2 className="title">Explore our models</h2>
    {isGenesis
      ? <div className="description">
        <p className="short">
          FarmBot Genesis is our flagship kit for prosumers and enthusiasts.
        </p>
        <p className="full">
          FarmBot Genesis is our flagship kit for prosumers and enthusiasts
          featuring our most advanced technology, features, and options.
          Coming 95% pre-assembled in the box, Genesis can be installed on
          an existing raised bed in an afternoon. It is suitable for fixed
          or mobile raised beds in classrooms, research labs, and backyards.
        </p>
      </div>
      : <div className="description">
        <p className="short">
          Covering 400% the area, Genesis XL can grow enough veggies for a
          family of four.
        </p>
        <p className="full">
          Covering 400% the area, FarmBot Genesis XL can grow enough veggies
          for a family of four, provides ample room for student competitions,
          and can take research experiments to new scale. Suitable for fixed
          installations at home, farm to fork restaurants, schools and
          universities, and commercial research facilities.
        </p>
      </div>}
    <div className={"buy-button-load-in"}>
      <a className="buy-button"
        target="_top"
        href={isGenesis
          ? ExternalUrl.Store.genesisKit(kitVersion)
          : ExternalUrl.Store.genesisXlKit(kitVersion)}>
        <p>Order Genesis</p>
        <p className="genesis-xl"
          style={{ display: isGenesis ? "none" : "inline-block" }}>
          XL
        </p>
        <p style={{ textTransform: "none" }}>{kitVersion}</p>
      </a>
    </div>
  </React.Fragment>;
};

interface ConfigRowProps {
  configKey: keyof ConfigWithPosition;
  children: React.ReactNode;
  addLabel?: string;
  searchTerms?: string[];
}

const ConfigSearchContext = React.createContext("");

const ConfigRow = (props: ConfigRowProps) => {
  const { configKey } = props;
  const search = React.useContext(ConfigSearchContext).trim().toLowerCase();
  const urlHasParam = (key: keyof ConfigWithPosition) =>
    !!(new URLSearchParams(window.location.search)).get(key);
  const removeParam = () => {
    setHasParam(false);
    if (configKey == "urlCameraPos") { clearCameraUrlParams(); }
    setUrlParam(configKey, "");
  };
  const [hasParam, setHasParam] = React.useState(urlHasParam(configKey));
  React.useEffect(() => {
    setHasParam(urlHasParam(configKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.search]);
  let label = configKey;
  if (props.addLabel) {
    label += ` (${props.addLabel})`;
  }
  const searchText = [label, ...(props.searchTerms || [])]
    .join(" ")
    .toLowerCase();
  if (search && !searchText.includes(search)) { return <React.Fragment />; }
  return <div className={"config-row"} key={configKey + window.location.search}>
    {hasParam && <p className={"x"} onClick={removeParam}>x</p>}
    <span className={"config-key"}>{label}</span>
    {props.children}
  </div>;
};

export const maybeAddParam =
  (paramAdd: boolean, configKey: string, value: string) =>
    (paramAdd || ["urlParamAutoAdd", "urlCameraPos"].includes(configKey))
    && value != "Reset all" &&
    setUrlParam(configKey, value);

interface SliderProps extends OverlayProps {
  configKey: keyof ConfigWithPosition;
  min: number;
  max: number;
  addLabel?: string;
}

const Slider = (props: SliderProps) => {
  const { config, setConfig, configKey, min, max } = props;
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (isNaN(newValue)) { return; }
    const update = { [configKey]: newValue };
    setConfig(modifyConfig(config, update));
    maybeAddParam(config.urlParamAutoAdd, configKey, "" + newValue);
  };
  const value = config[configKey] as number;
  return <ConfigRow configKey={configKey} addLabel={props.addLabel}>
    <input type={"number"} value={value} onChange={change} />
    <input
      type={"range"}
      min={min}
      max={max}
      value={value}
      onChange={change}
    />
  </ConfigRow>;
};

interface ToggleProps extends OverlayProps {
  configKey: keyof ConfigWithPosition;
  addLabel?: string;
}

const Toggle = (props: ToggleProps) => {
  const { config, setConfig, configKey } = props;
  return <ConfigRow configKey={configKey} addLabel={props.addLabel}>
    <input
      type={"checkbox"}
      checked={!!config[configKey]}
      title={configKey}
      onChange={e => {
        const newValue = e.target.checked;
        const update = { [configKey]: newValue };
        if (configKey == "animateSeasons") {
          setSeasonAnimationRunning(
            newValue,
            props.startTimeRef,
            props.seasonAnimationElapsedRef,
          );
          props.setSeasonAnimationPaused?.(!newValue);
        }
        setConfig(modifyConfig(config, update));
        if (configKey == "urlCameraPos" && !newValue) {
          clearCameraUrlParams();
        }
        maybeAddParam(config.urlParamAutoAdd, configKey, "" + newValue);
      }}
    />
  </ConfigRow>;
};

interface RadioProps extends OverlayProps {
  configKey: keyof ConfigWithPosition;
  options: string[];
  addLabel?: string;
}

const Radio = (props: RadioProps) => {
  const { config, setConfig, configKey, options, startTimeRef } = props;
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (startTimeRef && configKey == "plants") {
      startTimeRef.current = performance.now() / 1000;
    }
    const newValue = e.target.value;
    const update = { [configKey]: newValue };
    setConfig(modifyConfig(config, update));
    maybeAddParam(config.urlParamAutoAdd, configKey, "" + newValue);
  };
  return <ConfigRow
    configKey={configKey}
    addLabel={props.addLabel}
    searchTerms={options}>
    <div className={"options"}>
      {options.map(value =>
        <div key={value}>
          <input key={value}
            type={"radio"}
            name={configKey}
            title={`${configKey} ${value}`}
            value={value}
            checked={config[configKey] == value}
            onChange={change}
          />
          <label>{value}</label>
        </div>)}
    </div>
  </ConfigRow>;
};

export const PrivateOverlay = (props: OverlayProps) => {
  const bedMin = props.config.bedWallThickness * 2;
  const { config, setConfig } = props;
  const common = { ...props };
  const [search, setSearch] = React.useState("");
  // eslint-disable-next-line no-null/no-null
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const closeConfig = React.useCallback(() =>
    setConfig(modifyConfig(config, { config: false })), [config, setConfig]);
  React.useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  return <div className={"all-configs"}
    onKeyDown={e => e.key == "Escape" && closeConfig()}>
    <div className={"config-title"}>
      {"Configs"}
      <p className={"close"}
        onClick={closeConfig}>
        X
      </p>
    </div>
    <div className={"spacer"} />
    <input
      className={"config-search"}
      ref={searchInputRef}
      placeholder={"Search configs"}
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <ConfigSearchContext.Provider value={search}>
      <Toggle {...common} configKey={"urlParamAutoAdd"} />
      <Toggle {...common} configKey={"urlCameraPos"} />
      <Toggle {...common} configKey={"promoInfo"} />
      <Toggle {...common} configKey={"settingsBar"} />
      <Toggle {...common} configKey={"zoomBeacons"} />
      <div className={"config-section"}>
        <label>{"Presets"}</label>
        <Radio {...common} configKey={"label"} addLabel={"packaging"}
          options={["FarmBot Genesis", "FarmBot Genesis XL", "FarmBot Jr", "box"]} />
        <Radio {...common} configKey={"kitVersion"}
          options={["v1.9", "v1.8", "v1.7", "v1000"]} />
        <Radio {...common} configKey={"sizePreset"}
          options={["Jr", "Genesis", "Genesis XL"]} />
        <Radio {...common} configKey={"bedType"}
          options={["Standard", "Mobile"]} />
        <Radio {...common} configKey={"otherPreset"}
          options={["Initial", "Minimal", "Maximal", "Reset all"]} />
      </div>
      <div className={"config-section"}>
        <label>{"Bot State"}</label>
        <Slider {...common} configKey={"x"} min={0} max={props.config.botSizeX} />
        <Slider {...common} configKey={"y"} min={0} max={props.config.botSizeY} />
        <Slider {...common} configKey={"z"}
          min={props.config.negativeZ ? -props.config.botSizeZ : 0}
          max={props.config.negativeZ ? 0 : props.config.botSizeZ} />
        <Radio {...common} configKey={"tool"}
          options={["wateringNozzle", "rotaryTool", "soilSensor", "weeder",
            "seeder", "None"]} />
        <Toggle {...common} configKey={"trail"} />
        <Toggle {...common} configKey={"laser"} />
        <Toggle {...common} configKey={"waterFlow"} />
        <Toggle {...common} configKey={"light"} />
        <Toggle {...common} configKey={"vacuum"} />
        <Slider {...common} configKey={"rotary"} min={-1} max={1} />
      </div>
      <div className={"config-section"}>
        <label>{"Bot Dimensions"}</label>
        <Slider {...common} configKey={"botSizeX"} min={0} max={6000} />
        <Slider {...common} configKey={"botSizeY"} min={0} max={4000} />
        <Slider {...common} configKey={"botSizeZ"} min={0} max={1000} />
        <Toggle {...common} configKey={"bounds"} />
        <Toggle {...common} configKey={"grid"} />
        <Toggle {...common} configKey={"negativeZ"} />
        <Toggle {...common} configKey={"mirrorX"} />
        <Toggle {...common} configKey={"mirrorY"} />
        <Toggle {...common} configKey={"xyDimensions"} />
        <Toggle {...common} configKey={"zDimension"} />
        <Toggle {...common} configKey={"axes"} />
        <Slider {...common} configKey={"beamLength"} min={0} max={4000} />
        <Slider {...common} configKey={"columnLength"} min={0} max={1000} />
        <Slider {...common} configKey={"zAxisLength"} min={0} max={2000} />
        <Slider {...common} configKey={"bedXOffset"} min={-500} max={500} />
        <Slider {...common} configKey={"bedYOffset"} min={-1500} max={1500} />
        <Slider {...common} configKey={"zGantryOffset"} min={0} max={500} />
        <Toggle {...common} configKey={"tracks"} />
        <Toggle {...common} configKey={"cableCarriers"} />
        <Toggle {...common} configKey={"bot"} />
        <Radio {...common} configKey={"distanceIndicator"}
          options={["", "bedHeight", "beamLength", "columnLength", "zAxisLength"]} />
      </div>
      <div className={"config-section"}>
        <label>{"Bot Camera View"}</label>
        <Toggle {...common} configKey={"cameraView"} />
        <Slider {...common} configKey={"imgScale"} min={0} max={10} />
        <Slider {...common} configKey={"imgRotation"} min={0} max={360} />
        <Slider {...common} configKey={"imgOffsetX"} min={0} max={1000} />
        <Slider {...common} configKey={"imgOffsetY"} min={0} max={1000} />
        <Slider {...common} configKey={"imgCenterX"} min={0} max={1000} />
        <Slider {...common} configKey={"imgCenterY"} min={0} max={1000} />
        <Radio {...common} configKey={"imgOrigin"}
          options={["TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"]} />
        <Slider {...common} configKey={"lastImageCapture"} min={0} max={100000} />
      </div>
      <div className={"config-section"}>
        <label>{"Bed Properties"}</label>
        <Slider {...common} configKey={"bedWallThickness"} min={0} max={200} />
        <Slider {...common} configKey={"bedHeight"} min={0} max={1000} />
        <Slider {...common} configKey={"ccSupportSize"} min={0} max={200} />
        <Slider {...common} configKey={"bedWidthOuter"} min={bedMin} max={3100} />
        <Slider {...common} configKey={"bedLengthOuter"} min={bedMin} max={6100} />
        <Slider {...common} configKey={"bedZOffset"} min={0} max={1000} />
        <Slider {...common} configKey={"legSize"} min={0} max={200} />
        <Toggle {...common} configKey={"legsFlush"} />
        <Slider {...common} configKey={"extraLegsX"} min={0} max={10} />
        <Slider {...common} configKey={"extraLegsY"} min={0} max={10} />
        <Slider {...common} configKey={"bedBrightness"} min={1} max={12} />
      </div>
      <div className={"config-section"}>
        <label>{"Soil"}</label>
        <Slider {...common} configKey={"soilBrightness"} min={1} max={12} />
        <Slider {...common} configKey={"soilHeight"} min={0} max={1000} />
        <Radio {...common} configKey={"soilSurface"}
          options={["flat", "random"]} />
        <Slider {...common} configKey={"soilSurfacePointCount"} min={0} max={200} />
        <Slider {...common} configKey={"soilSurfaceVariance"} min={0} max={1000} />
        <Toggle {...common} configKey={"showSoilPoints"} />
        <Toggle {...common} configKey={"exaggeratedZ"} />
        <Toggle {...common} configKey={"moistureDebug"} />
        <Slider {...common} configKey={"surfaceDebug"} min={0} max={2} />
      </div>
      <div className={"config-section"}>
        <label>{"Plants"}</label>
        <Radio {...common} configKey={"plants"} startTimeRef={props.startTimeRef}
          options={["Winter", "Spring", "Summer", "Fall", "Random", "None"]} />
        <Toggle {...common} configKey={"labels"} />
        <Toggle {...common} configKey={"labelsOnHover"} />
        <Toggle {...common} configKey={"promoSpread"} />
        <Toggle {...common} configKey={"animate"} />
        <Toggle {...common} configKey={"animateSeasons"} />
      </div>
      <div className={"config-section"}>
        <label>{"Camera"}</label>
        <Toggle {...common} configKey={"perspective"} />
        <Toggle {...common} configKey={"zoom"} />
        <Toggle {...common} configKey={"pan"} />
        <Toggle {...common} configKey={"rotate"} />
        <Slider {...common} configKey={"viewpointHeading"} min={0} max={360} />
        <Slider {...common} configKey={"zoomFactor"} min={1} max={100} />
        <Toggle {...common} configKey={"cameraSelectionView"} />
        <Toggle {...common} configKey={"cameraFitDebug"} />
        <Toggle {...common} configKey={"lowDetail"} />
      </div>
      <div className={"config-section"}>
        <label>{"Environment"}</label>
        <Radio {...common} configKey={"scene"}
          options={["Outdoor", "Lab", "Greenhouse"]} />
        <Toggle {...common} configKey={"ground"} />
        <Toggle {...common} configKey={"utilitiesPost"} />
        <Toggle {...common} configKey={"packaging"} />
        <Toggle {...common} configKey={"clouds"} />
        <Toggle {...common} configKey={"constellations"} />
        <Toggle {...common} configKey={"solar"} />
        <Toggle {...common} configKey={"people"} />
        <Toggle {...common} configKey={"north"} />
        <Slider {...common} configKey={"heading"} min={0} max={360} />
      </div>
      <div className={"config-section"}>
        <label>{"Lighting"}</label>
        <Slider {...common} configKey={"sunInclination"} min={-180} max={180} />
        <Slider {...common} configKey={"sunAzimuth"} min={0} max={360} />
        <Slider {...common} configKey={"sun"} min={0} max={200} />
        <Slider {...common} configKey={"ambient"} min={0} max={200} />
        <Toggle {...common} configKey={"light"} addLabel={"bot LEDs"} />
        <Toggle {...common} configKey={"lightsDebug"} />
      </div>
      <div className={"config-section"}>
        <label>{"Dev"}</label>
        <Toggle {...common} configKey={"threeAxes"} />
        <Toggle {...common} configKey={"stats"} />
        <Toggle {...common} configKey={"viewCube"} />
        <Toggle {...common} configKey={"eventDebug"} />
        <Toggle {...common} configKey={"cableDebug"} />
        <Toggle {...common} configKey={"zoomBeaconDebug"} />
        <Toggle {...common} configKey={"constellationsDebug"} />
        <Toggle {...common} configKey={"config"} />
      </div>
    </ConfigSearchContext.Provider>
  </div>;
};
