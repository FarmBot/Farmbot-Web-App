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
    device = FactoryBot.create(:device, fbos_version: "3.2.1")
    ts = TelemetryService.new
    routing_key = "bot.device_#{device.id}.telemetry"
    payload = {
      foo: "bar",
      # I'm putting this key here to make sure
      # bots cannot change their `device_id` /
      # spoof telemetry of other bots.
      device: "device_456",
    }.to_json
    expect(device.fbos_version).to eq("3.2.1")
    expected = [
      "{\"foo\":\"bar\"," \
      "\"device\":\"device_#{device.id}\"," \
      "\"is_telemetry\":true," \
      "\"message\":\"TELEMETRY MESSAGE " \
      "FROM device_#{device.id} #{device.fbos_version}\"}\n",
    ].join("")
    delivery_info =
      FakeDeliveryInfo.new(routing_key, payload)
    expect do
      ts.process(delivery_info, payload)
    end.to output(expected).to_stdout
  end
end
