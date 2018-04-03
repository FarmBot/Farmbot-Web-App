import * as React from "react";
import {
  Widget, WidgetHeader, WidgetBody, Col, BlurableInput
} from "../ui/index";
import { t } from "i18next";
import { FarmwareManifest, Dictionary, Pair, FarmwareConfig } from "farmbot";
import { betterCompact } from "../util";
import { getDevice } from "../device";
import * as _ from "lodash";

interface FarmwareFormsProps {
  farmwares: Dictionary<FarmwareManifest | undefined>;
  user_env: Record<string, string | undefined>;
}

export function FarmwareForms(props: FarmwareFormsProps): JSX.Element {

  function inputChange(key: string, e: React.SyntheticEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    getDevice().setUserEnv({ [key]: value }).catch(() => { });
  }

  function getEnvName(farmwareName: string, configName: string) {
    return `${_.snakeCase(farmwareName)}_${configName}`;
  }

  function getValue(farmwareName: string, currentConfig: FarmwareConfig) {
    return (user_env[getEnvName(farmwareName, currentConfig.name)]
      || _.toString(currentConfig.value));
  }

  function run(farmwareName: string, config: FarmwareConfig[]) {
    const pairs = config.map<Pair>((x) => {
      const label = getEnvName(farmwareName, x.name);
      const value = getValue(farmwareName, x);
      return { kind: "pair", args: { value, label } };
    });
    getDevice().execScript(farmwareName, pairs).catch(() => { });
  }

  const { farmwares, user_env } = props;
  const farmwareData = betterCompact(Object
    .keys(farmwares)
    .map(x => farmwares[x]))
    .map((fw) => {
      const needsWidget = fw.config && fw.config.length > 0;
      return needsWidget ? fw : undefined;
    });
  return <div id="farmware-forms">
    {farmwareData.map((farmware, i) => {
      return farmware ?
        <Col key={i} xs={12} sm={6}>
          <Widget className={_.kebabCase(farmware.name)}>
            <WidgetHeader
              title={farmware.name}
              helpText={farmware.meta.version ? " version: "
                + farmware.meta.version : ""}>
              <button
                className="fb-button green"
                onClick={() => run(farmware.name, farmware.config)}>
                {t("Run")}
              </button>
            </WidgetHeader>
            <WidgetBody>
              {farmware.meta.description &&
                <div>
                  <label>Description</label>
                  <p>{farmware.meta.description}</p>
                  <hr />
                </div>}
              {farmware.config.map((config) => {
                return <div key={config.name} id={config.name}>
                  <label>{config.label}</label>
                  <BlurableInput type="text"
                    onCommit={(e) =>
                      inputChange(getEnvName(farmware.name, config.name), e)}
                    value={getValue(farmware.name, config)} />
                </div>;
              })}
            </WidgetBody>
          </Widget>
        </Col> : <div key={i} />;
    })}
  </div>;
}
