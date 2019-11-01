require "spec_helper"

describe TelemetryService do
  it "handles malformed JSON" do
    ts = TelemetryService.new
    routing_key = "bot.device_123.telemetry"
    payload = "}"
    expected = "{\"device\":\"device_123\"," \
    "\"is_telemetry\":true,\"bad_json\":\"}\"," \
    "\"message\":\"FAILED TELEMETRY MESSAGE " \
    "FROM device_123\"}\n"
    delivery_info =
      FakeDeliveryInfo.new(routing_key, payload)
    expect do
      ts.process(delivery_info, payload)
    end.to output(expected).to_stdout
  end

  it "parses telemetry from the device" do
    ts = TelemetryService.new
    routing_key = "bot.device_123.telemetry"
    payload = {
      foo: "bar",
      # I'm putting this key here to make sure
      # bots cannot change their `device_id` /
      # spoof teleemetry of other bots.
      device: "device_456",
    }.to_json
    expected = [
      "{\"foo\":\"bar\"," \
      "\"device\":\"device_123\"," \
      "\"is_telemetry\":true," \
      "\"message\":\"TELEMETRY MESSAGE " \
      "FROM device_123\"}\n",
    ].join("")
    delivery_info =
      FakeDeliveryInfo.new(routing_key, payload)
    expect do
      ts.process(delivery_info, payload)
    end.to output(expected).to_stdout
  end
end
