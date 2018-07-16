require "spec_helper"

describe Resources::PreProcessor do
  DeliveryInfoShim = Struct.new(:routing_key)
  CHANNEL_TPL =
    "bot.device_%{device_id}.resources_v0.%{action}.%{klass}.%{id}.%{uuid}"

  let(:pb) { FactoryBot.create(:pin_binding) }

  let(:props) do
    { device_id: pb.device.id,
       action:   "destroy",
       klass:    pb.class,
       id:       pb.id,
       uuid:     SecureRandom.uuid }
  end

  let(:preprocessed) do
    body   = {}.to_json
    chan   = CHANNEL_TPL % props
    Resources::PreProcessor.from_amqp(DeliveryInfoShim.new(chan), body)
  end
  it "converts string types to real types" do
    expect(preprocessed[:action]).to      eq("destroy")
    expect(preprocessed[:device]).to      eq(pb.device)
    expect(preprocessed[:body]).to        eq({})
    expect(preprocessed[:resource]).to    eq(PinBinding)
    expect(preprocessed[:resource_id]).to eq(pb.id)
    expect(preprocessed[:uuid]).to        eq(props[:uuid])
  end

  it "handles bad JSON" do
    body   = "}{"
    chan   = CHANNEL_TPL % props
    expect do
      Resources::PreProcessor.from_amqp(DeliveryInfoShim.new(chan), body)
    end.to raise_error(Mutations::ValidationException, "body must be a JSON object")
  end

  describe Resources::Service do
    it "handles failure" do
      body   = "[]"
      chan   = CHANNEL_TPL % props
      Resources::Service.process(DeliveryInfoShim.new(chan), body)
    end
  end

  describe Resources::Job do
    it "allows nesting?" do
      y = preprocessed
      before = PinBinding.count
      x = Resources::Job.run(y)
      expect(x.success?).to be true
      expect(before).to     be > PinBinding.count
    end
  end
end
