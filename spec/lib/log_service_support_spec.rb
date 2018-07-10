require "spec_helper"
require_relative "../../lib/log_service"

describe LogService do
  normal_payl  = '{"meta":{"z":0,"y":0,"x":0,"type":"info","major_version":6},' +
  '"message":"HQ FarmBot TEST 123 Pin 13 is 0","created_at":'+
  '1512585641,"channels":[]}'

  legacy_payl  = '{"meta":{"z":0,"y":0,"x":0,"type":"info"},' +
  '"message":"HQ FarmBot TEST 123 Pin 13 is 0","created_at":'+
  '1512585641,"channels":[]}'
  FakeDeliveryInfo   = Struct.new(:routing_key)
  device_id          = FactoryBot.create(:device).id
  fake_delivery_info = FakeDeliveryInfo.new("bot.device_#{device_id}.logs")

  class FakeLogChan
    attr_reader :subcribe_calls

    def initialize
      @subcribe_calls = 0
    end

    def subscribe(*)
      @subcribe_calls += 1
    end
  end

  it "calls .subscribe() on Transport." do
    Transport.current.clear!
    load "lib/log_service_runner.rb"
    arg1        = Transport.current.connection.calls[:subscribe].last[0]
    routing_key = Transport.current.connection.calls[:bind].last[1][:routing_key]
    expect(arg1).to        eq({block: true})
    expect(routing_key).to eq("bot.*.logs")
  end

  it "creates new messages in the DB when called" do
    Log.destroy_all
    b4 = Log.count
    LogService.process(fake_delivery_info, normal_payl)
    expect(Log.count).to be > b4
  end

  it "warns the user that they've been throttled" do
    data           = AmqpLogParser::DeliveryInfo.new
    data.device_id = FactoryBot.create(:device).id
    time           = Time.now
    expect_any_instance_of(Device).to receive(:maybe_throttle).with(time)
    LogService.warn_user(data, time)
  end
end
