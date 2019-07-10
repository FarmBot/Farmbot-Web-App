require "spec_helper"
# require_relative "../../lib/log_service"

describe LogService do
  normal_payl = {
    z: 0,
    y: 0,
    x: 0,
    type: "info",
    major_version: 6,
    message: "HQ FarmBot TEST 123 Pin 13 is 0",
    created_at: 1512585641,
    channels: [],
  }.to_json

  FakeDeliveryInfo = Struct.new(:routing_key)

  let!(:device_id) { FactoryBot.create(:device).id }
  let!(:fake_delivery_info) do
    FakeDeliveryInfo.new("bot.device_#{device_id}.logs")
  end

  it "Sends errors to rollbar" do
    expect(Rollbar).to receive(:error)
    LogService.new().deliver("") # Will raise NoMethodError
  end

  it "has a log_channel" do
    calls = Transport.current.log_channel.calls[:bind]
    expect(calls).to include(["amq.topic", { routing_key: "bot.*.logs" }])
  end

  it "has a resource_channel" do
    calls = Transport.current.resource_channel.calls[:bind]
    expect(calls).to include([
      "amq.topic",
      { routing_key: Transport::RESOURCE_ROUTING_KEY },
    ])
  end

  it "creates new messages in the DB when called" do
    Log.destroy_all
    b4 = Log.count
    LogService.new.process(fake_delivery_info, normal_payl)
    expect(Log.count).to be > b4
  end

  it "warns the user that they've been throttled" do
    data = AmqpLogParser::DeliveryInfo.new
    data.device_id = FactoryBot.create(:device).id
    time = Time.now
    expect_any_instance_of(Device).to receive(:maybe_throttle).with(time)
    LogService.new.warn_user(data, time)
  end
end
