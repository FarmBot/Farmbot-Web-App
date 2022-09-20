require "spec_helper"

describe TelemetryService do
  normal_hash = ->() do
    return {
             telemetry_soc_temp: 100,
             telemetry_throttled: "0x0",
             telemetry_wifi_level_percent: 80,
             telemetry_uptime: 12345,
             telemetry_memory_usage: 100,
             telemetry_disk_usage: 1,
             telemetry_cpu_usage: 1,
             telemetry_target: "rpi",
           }
  end

  normal_payl = normal_hash[].to_json

  let!(:device) { FactoryBot.create(:device) }
  let!(:device_id) { device.id }
  let!(:fake_delivery_info) do
    FakeDeliveryInfo.new("bot.device_#{device_id}.telemetry", device)
  end

  it "sends errors to rollbar" do
    expect(Rollbar).to receive(:error)
    TelemetryService.new().deliver("", "") # Will raise NoMethodError
  end

  it "creates new telemetry in the DB when called" do
    Telemetry.destroy_all
    b4 = Telemetry.count
    TelemetryService.new.process(fake_delivery_info, normal_payl)
    expect(Telemetry.count).to be > b4
  end

  it "handles bad params" do
    expect do
      TelemetryService.new.process(fake_delivery_info, {})
    end.to raise_error(Mutations::ValidationException)
  end

  it "handles malformed params" do
    expect do
      TelemetryService.new.process(fake_delivery_info, "}}{{")
    end.to raise_error(Mutations::ValidationException)
  end

  it "throttles a device that sends too many logs" do
    violation = ThrottlePolicy::Violation.new(Time.now, "whatever")
    return_error = receive(:violation_for).with(any_args).and_return(violation)
    expect(TelemetryService::THROTTLE_POLICY).to(return_error)
    j = normal_hash[].to_json
    TelemetryService.new.process(fake_delivery_info, j)
  end

  it "does not save telemetry with missing fields" do
    Telemetry.destroy_all
    j = normal_hash[].merge(telemetry_target: nil).to_json
    TelemetryService.new.process(fake_delivery_info, j)
    if Telemetry.count != 0
      opps = "Expected there to be no telemetry with a 'nil' target. " \
      "There are, though."
      fail(opps)
    end
    expect(Telemetry.count).to be 0
  end

  it "parses telemetry from the device" do
    device = FactoryBot.create(:device, fbos_version: "3.2.1")
    ts = TelemetryService.new
    routing_key = "bot.device_#{device.id}.telemetry"
    payload = normal_hash[].merge(
      foo: "bar",
      # I'm putting this key here to make sure
      # bots cannot change their `device_id` /
      # spoof telemetry of other bots. -RC
      device: "device_456",
    ).to_json
    expect(device.fbos_version).to eq("3.2.1")
    expected = [
      "{\"telemetry_soc_temp\":100," \
      "\"telemetry_throttled\":\"0x0\"," \
      "\"telemetry_wifi_level_percent\":80," \
      "\"telemetry_uptime\":12345," \
      "\"telemetry_memory_usage\":100," \
      "\"telemetry_disk_usage\":1," \
      "\"telemetry_cpu_usage\":1," \
      "\"telemetry_target\":\"rpi\"," \
      "\"foo\":\"bar\"," \
      "\"device\":\"device_#{device.id}\"," \
      "\"is_telemetry\":true," \
      "\"message\":\"TELEMETRY MESSAGE " \
      "FROM device_#{device.id} #{device.fbos_version}\"}\n",
    ].join("")
    delivery_info = FakeDeliveryInfo.new(routing_key, payload)
    expect do
      ts.process(delivery_info, payload)
    end.to output(expected).to_stdout
  end
end
