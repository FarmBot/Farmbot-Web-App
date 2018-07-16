require "spec_helper"

describe AmqpLogParser do
  it "invalidates non-hash logs" do
    data = AmqpLogParser.run! payload:     [].to_json,
                              routing_key: "device_1.device_1.device_1"
                              expect(data.valid?).to be(false)
                              expect(data.problems).to include AmqpLogParser::NOT_HASH
                            end

  it "invalidates type == `fun` logs" do
    payload         = AmqpLogParser::EXAMPLE_JSON.deep_dup
    payload["type"] = Log::DISCARD.sample || "fun"
    data = AmqpLogParser.run! payload:     payload.to_json,
                              routing_key: "device_1.device_1.device_1"
    expect(data.valid?).to be(false)
    expect(data.problems).to include AmqpLogParser::DISCARD
  end

  it "invalidates type == `nil` logs" do
    payload         = AmqpLogParser::EXAMPLE_JSON.deep_dup
    payload["type"] = nil
    payload["meta"].delete("type")
    data = AmqpLogParser.run! payload:     payload.to_json,
                              routing_key: "device_1.device_1.device_1"
    expect(data.valid?).to be(false)
    expect(data.problems).to include AmqpLogParser::DISCARD
  end

  it "invalidates legacy logs" do
    payload                          = AmqpLogParser::EXAMPLE_JSON.deep_dup
    payload["major_version"]         = nil
    payload["meta"]["major_version"] = nil
    data = AmqpLogParser.run! payload:     payload.to_json,
                              routing_key: "device_1.device_1.device_1"
    expect(data.valid?).to be(false)
    expect(data.problems).to include AmqpLogParser::TOO_OLD
  end
end
