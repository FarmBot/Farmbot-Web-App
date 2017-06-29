import * as React from "react";
import { Row, Col } from "../../ui/index";
import { destroy, edit } from "../../api/crud";
import { PeripheralFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";

export function PeripheralForm(props: PeripheralFormProps) {
  let { dispatch, peripherals } = props;

  return <div>
    {sortResourcesById(peripherals).map(p => {
      return <Row key={p.uuid}>
        <Col xs={6}>
          <input type="text"
            placeholder="Label"
            value={p.body.label}
            onChange={(e) => {
              let { value } = e.currentTarget;
              dispatch(edit(p, { label: value }));
            }}
          />
        </Col>
        <Col xs={4}>
          <input type="number"
            value={(p.body.pin || "").toString()}
            placeholder="Pin #"
            onChange={(e) => {
              let { value } = e.currentTarget;
              let update: Partial<typeof p.body> = { pin: parseInt(value, 10) };
              dispatch(edit(p, update));
            }} />
        </Col>
        <Col xs={2}>
          <button
            className="red fb-button"
            onClick={() => { dispatch(destroy(p.uuid)); }}
          >
            <i className="fa fa-minus" />
          </button>
        </Col>
      </Row>
    })}
  </div>
};
