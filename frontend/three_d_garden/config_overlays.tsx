import React from "react";
import { ConfigWithPosition, modifyConfig } from "./config";
import { setUrlParam } from "./zoom_beacons_constants";
import { ExternalUrl } from "../external_urls";

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
  startTimeRef?: React.RefObject<number>;
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
}

const PublicOverlaySection = (props: SectionProps) => {
  const {
    title, configKey, options, config, setConfig, toolTip, setToolTip, startTimeRef,
  } = props;
  return <div className={"setting-section"}>
    <div className="setting-title">{title}</div>
    <div className={"row"}>
      {Object.entries(options).map(([preset, label]) => {
        const active = label == config[configKey];
        const disabled = label == "Mobile"
          && config.sizePreset == "Genesis XL";
        const className = [
          preset,
          active ? "active" : "",
          disabled ? "disabled" : "",
        ].join(" ");
        const update = { [configKey]: label };
        return <button key={preset} className={className}
          onClick={() => {
            if (startTimeRef && configKey == "plants") {
              startTimeRef.current = performance.now() / 1000;
            }
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
            setConfig(modifyConfig(config, update));
          }}>
          {label}
        </button>;
      })}
    </div>
  </div>;
};

export const PublicOverlay = (props: OverlayProps) => {
  const { config, setConfig, toolTip, setToolTip } = props;
  const commonSectionProps = { config, setConfig, toolTip, setToolTip };

  return <div className={"overlay"}>
    {config.settingsBar && !props.activeFocus &&
      <div className={"settings-bar"}>
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
          options={{
            "winter": "Winter",
            "spring": "Spring",
            "summer": "Summer",
            "fall": "Fall",
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
      </div>}
    {config.promoInfo && !props.activeFocus &&
      <PromoInfo
        isGenesis={config.sizePreset == "Genesis"}
        kitVersion={config.kitVersion} />}
  </div>;
};

interface PromoInfoProps {
  isGenesis: boolean;
  kitVersion: string;
}

const PromoInfo = (props: PromoInfoProps) => {
  const { isGenesis, kitVersion } = props;
  return <div className="promo-info">
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
  </div>;
};

interface ConfigRowProps {
  configKey: keyof ConfigWithPosition;
  children: React.ReactNode;
  addLabel?: string;
}

const ConfigRow = (props: ConfigRowProps) => {
  const { configKey } = props;
  const urlHasParam = (key: keyof ConfigWithPosition) =>
    !!(new URLSearchParams(window.location.search)).get(key);
  const removeParam = () => {
    setHasParam(false);
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
  return <div className={"config-row"} key={configKey + window.location.search}>
    {hasParam && <p className={"x"} onClick={removeParam}>x</p>}
    <span className={"config-key"}>{label}</span>
    {props.children}
  </div>;
};

export const maybeAddParam =
  (paramAdd: boolean, configKey: string, value: string) =>
    (paramAdd || configKey == "urlParamAutoAdd") && value != "Reset all" &&
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
        setConfig(modifyConfig(config, update));
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
  return <ConfigRow configKey={configKey} addLabel={props.addLabel}>
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
  return <div className={"all-configs"}>
    <details>
      <summary>
        {"Configs"}
        <p className={"close"}
          onClick={() => setConfig(modifyConfig(config, { config: false }))}>
          X
        </p>
      </summary>
      <div className={"spacer"} />
      <Toggle {...common} configKey={"urlParamAutoAdd"} />
      <Toggle {...common} configKey={"promoInfo"} />
      <Toggle {...common} configKey={"settingsBar"} />
      <Toggle {...common} configKey={"zoomBeacons"} />
      <label>{"Presets"}</label>
      <Radio {...common} configKey={"label"} addLabel={"packaging"}
        options={["FarmBot Genesis", "FarmBot Genesis XL", "FarmBot Jr", "box"]} />
      <Radio {...common} configKey={"kitVersion"}
        options={["v1.8", "v1.7", "v1000"]} />
      <Radio {...common} configKey={"sizePreset"}
        options={["Jr", "Genesis", "Genesis XL"]} />
      <Radio {...common} configKey={"bedType"}
        options={["Standard", "Mobile"]} />
      <Radio {...common} configKey={"otherPreset"}
        options={["Initial", "Minimal", "Maximal", "Reset all"]} />
      <label>{"Bot State"}</label>
      <Slider {...common} configKey={"x"} min={0} max={props.config.botSizeX} />
      <Slider {...common} configKey={"y"} min={0} max={props.config.botSizeY} />
      <Slider {...common} configKey={"z"} min={0} max={props.config.botSizeZ} />
      <Radio {...common} configKey={"tool"}
        options={["wateringNozzle", "rotaryTool", "soilSensor", "weeder",
          "seeder", "None"]} />
      <Toggle {...common} configKey={"trail"} />
      <Toggle {...common} configKey={"laser"} />
      <Toggle {...common} configKey={"waterFlow"} />
      <Toggle {...common} configKey={"light"} />
      <Toggle {...common} configKey={"vacuum"} />
      <Slider {...common} configKey={"rotary"} min={-1} max={1} />
      <label>{"Bot Dimensions"}</label>
      <Slider {...common} configKey={"botSizeX"} min={0} max={6000} />
      <Slider {...common} configKey={"botSizeY"} min={0} max={4000} />
      <Slider {...common} configKey={"botSizeZ"} min={0} max={1000} />
      <Toggle {...common} configKey={"bounds"} />
      <Toggle {...common} configKey={"grid"} />
      <Toggle {...common} configKey={"negativeZ"} />
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
      <label>{"Plants"}</label>
      <Radio {...common} configKey={"plants"} startTimeRef={props.startTimeRef}
        options={["Winter", "Spring", "Summer", "Fall", "Random", "None"]} />
      <Toggle {...common} configKey={"labels"} />
      <Toggle {...common} configKey={"labelsOnHover"} />
      <Toggle {...common} configKey={"promoSpread"} />
      <Toggle {...common} configKey={"animate"} />
      <Toggle {...common} configKey={"animateSeasons"} />
      <label>{"Camera"}</label>
      <Toggle {...common} configKey={"perspective"} />
      <Toggle {...common} configKey={"zoom"} />
      <Toggle {...common} configKey={"pan"} />
      <Toggle {...common} configKey={"rotate"} />
      <Toggle {...common} configKey={"lowDetail"} />
      <label>{"Environment"}</label>
      <Radio {...common} configKey={"scene"}
        options={["Outdoor", "Lab", "Greenhouse"]} />
      <Toggle {...common} configKey={"ground"} />
      <Toggle {...common} configKey={"utilitiesPost"} />
      <Toggle {...common} configKey={"packaging"} />
      <Toggle {...common} configKey={"clouds"} />
      <Toggle {...common} configKey={"solar"} />
      <Toggle {...common} configKey={"desk"} />
      <Toggle {...common} configKey={"people"} />
      <Toggle {...common} configKey={"north"} />
      <Slider {...common} configKey={"heading"} min={0} max={360} />
      <label>{"Lighting"}</label>
      <Slider {...common} configKey={"sunInclination"} min={-180} max={180} />
      <Slider {...common} configKey={"sunAzimuth"} min={0} max={360} />
      <Slider {...common} configKey={"sun"} min={0} max={200} />
      <Slider {...common} configKey={"ambient"} min={0} max={200} />
      <Toggle {...common} configKey={"light"} addLabel={"bot LEDs"} />
      <Toggle {...common} configKey={"lightsDebug"} />
      <label>{"Dev"}</label>
      <Toggle {...common} configKey={"threeAxes"} />
      <Toggle {...common} configKey={"stats"} />
      <Toggle {...common} configKey={"viewCube"} />
      <Toggle {...common} configKey={"eventDebug"} />
      <Toggle {...common} configKey={"cableDebug"} />
      <Toggle {...common} configKey={"zoomBeaconDebug"} />
      <Toggle {...common} configKey={"config"} />
    </details>
  </div>;
};
