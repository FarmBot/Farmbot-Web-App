export function PeripheralSelection() {
  return <Row>
    <Col xs={6} md={3}>
      <label htmlFor="peripheral">
        <input type="checkbox"
          id={"peripheral"}
          onChange={() => console.log("OK")}
          checked={true} />
        {t(" Use peripheral value")}
      </label>
    </Col>
  </Row>;
}
