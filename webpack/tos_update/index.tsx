import * as React from "react";
import { render } from "react-dom";
import axios from "axios";
import { t, init } from "i18next";
import { fun as log, error as logError, init as logInit } from "farmbot-toastr";
import { AuthState } from "../auth/interfaces";
import { Session } from "../session";
import { prettyPrintApiErrors } from "../util";
import { detectLanguage } from "../i18n";
import { API } from "../api";
import "../css/_index.scss";
import { Row, Col, Widget, WidgetHeader, WidgetBody } from "../ui/index";

interface Props { }
interface State {
  email: string;
  password: string;
  agree_to_terms: boolean;
}

export class TosUpdate extends React.Component<Props, Partial<State>> {
  constructor(props: Props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = { agree_to_terms: true };
  }

  set = (name: keyof State) => (event: React.FormEvent<HTMLInputElement>) => {
    const state: { [name: string]: State[keyof State] } = {};
    state[name] = (event.currentTarget).value;
    this.setState(state);
  };

  submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password, agree_to_terms } = this.state;
    const payload = { user: { email, password, agree_to_terms } };
    API.setBaseUrl(API.fetchBrowserLocation());
    axios
      .post<AuthState>(API.current.tokensPath, payload)
      .then(resp => {
        Session.replaceToken(resp.data);
        window.location.href = "/app/controls";
      })
      .catch(error => {
        logError(prettyPrintApiErrors(error));
      });
  }

  get tosLoadOk() { return (globalConfig.TOS_URL && globalConfig.PRIV_URL); }

  tosForm() {
    if (this.tosLoadOk) {
      return <form onSubmit={this.submit}>
        <div className="input-group">
          <label> {t("Email")} </label>
          <input type="email"
            onChange={this.set("email").bind(this)}>
          </input>
          <label>{t("Password")}</label>
          <input type="password"
            onChange={this.set("password").bind(this)}>
          </input>
          <ul>
            <li>
              <a href={globalConfig.TOS_URL}>
                {t("Terms of Service")}
              </a>
              <span className="fa fa-external-link" />
            </li>
            <li>
              <a href={globalConfig.PRIV_URL}>
                {t("Privacy Policy")}
              </a>
              <span className="fa fa-external-link" />
            </li>
          </ul>
          <Row>
            <Col xs={12}>
              <button className="green fb-button">
                {t("I Agree to the Terms of Service")}
              </button>
            </Col>
          </Row>
        </div>
      </form>;
    } else {
      return <div>
        <p>
          {t("Something went wrong while rendering this page.")}
        </p>
        <p>
          {t("Please send us an email at contact@farmbot.io or see the ")}
          <a href="http://forum.farmbot.org/">
            {t("FarmBot forum.")}
          </a>
        </p>
      </div>;
    }
  }

  componentDidMount() {
    logInit();
    const body = t("Before logging in, you must agree to our latest Terms" +
      " of Service and Privacy Policy");
    log(body, "New Terms of Service");
  }

  render() {
    return <div className="static-page">
      <div className="all-content-wrapper">
        <Widget>
          <WidgetHeader title={
            this.tosLoadOk
              ? "Agree to Terms of Service"
              : "Problem Loading Terms of Service"} />
          <WidgetBody>
            {this.tosForm()}
          </WidgetBody>
        </Widget>
      </div>
    </div>;
  }
}

detectLanguage().then((config) => {
  init(config, (err, t2) => {
    const node = document.createElement("DIV");
    node.id = "root";
    document.body.appendChild(node);

    const reactElem = React.createElement(TosUpdate, {});
    const domElem = document.getElementById("root");

    if (domElem) {
      render(reactElem, domElem);
    } else {
      throw new Error(t2("Add a div with id `root` to the page first."));
    }
  });
});
