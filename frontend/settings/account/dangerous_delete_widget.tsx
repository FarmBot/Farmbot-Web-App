import React from "react";
import { Row } from "../../ui";
import { DangerousDeleteProps, DeletionRequest } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { clone } from "lodash";

/** Widget for permanently deleting large amounts of user data. */
export const DangerousDeleteWidget = (props: DangerousDeleteProps) => {
  const [password, setPassword] = React.useState("");
  // eslint-disable-next-line no-null/no-null
  const inputRef = React.useRef<HTMLInputElement>(null);

  return <div className="grid">
    <label>
      {t(props.title)}
    </label>
    <div className="settings-warning-banner">
      <p>
        {t(props.warning)}
        <br /><br />
        {t(props.confirmation)}
      </p>
    </div>
    <div className="grid">
      <Row className="grid-exp-1">
        <div className="grid half-gap">
          <label htmlFor={"password"}>
            {t("Enter Password")}
          </label>
          <input
            ref={inputRef}
            id={"password"}
            type={"password"}
            onBlur={e => setPassword(e.currentTarget.value)} />
        </div>
        <button
          onClick={() => {
            const payload: DeletionRequest = clone({ password });
            setPassword("");
            inputRef.current && (inputRef.current.value = "");
            props.dispatch(props.onClick(payload));
          }}
          className="red fb-button"
          title={t(props.title)}
          type="button">
          {t(props.title)}
        </button>
      </Row>
    </div>
  </div>;
};
