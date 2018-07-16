require "spec_helper"

describe Resources::PreProcessor do
  DeliveryInfoShim = Struct.new(:routing_key)
  CHANNEL_TPL = [
      "bot",
      "device_%{device_id}",
      "resources_v0",
      "%{action}",
      "%{klass}",
      "%{id}",
      "%{uuid}",
    ].join(".")
  let(:pb) { FactoryBot.create(:pin_binding) }
  let(:props) do
    { device_id: pb.device.id,
               action:    "destroy",
               klass:     pb.class,
               id:        pb.id,
               uuid:      SecureRandom.uuid }
  end

  it "converts string types to real types" do
    body   = {}.to_json
    chan   = CHANNEL_TPL % props
    result = Resources::PreProcessor.from_amqp(DeliveryInfoShim.new(chan), body)
    expect(result[:action]).to      eq("destroy")
    expect(result[:device]).to      eq(pb.device)
    expect(result[:body]).to        eq({})
    expect(result[:resource]).to    eq(PinBinding)
    expect(result[:resource_id]).to eq(pb.id)
    expect(result[:uuid]).to        eq(props[:uuid])
  end

  it "handles bad JSON" do
    body   = "}{"
    chan   = CHANNEL_TPL % props
    expect do
      Resources::PreProcessor.from_amqp(DeliveryInfoShim.new(chan), body)
    end.to raise_error(Mutations::ValidationException, "body must be a JSON object")
  end
end
