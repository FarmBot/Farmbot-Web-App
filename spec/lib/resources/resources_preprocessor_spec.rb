require "spec_helper"

describe Resources::Preprocessor do
  DeliveryInfoShim = Struct.new(:routing_key)

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
    chan   = Resources::CHANNEL_TPL % props
    Resources::Preprocessor.from_amqp(DeliveryInfoShim.new(chan), body)
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
    chan   = Resources::CHANNEL_TPL % props
    expect do
      Resources::Preprocessor.from_amqp(DeliveryInfoShim.new(chan), body)
    end.to raise_error(Mutations::ValidationException, "body must be a JSON object")
  end

  describe Resources::Service do
    it "handles syntax errors using step1" do
      body   = "[]"
      chan   = Resources::CHANNEL_TPL % props
      shim   = DeliveryInfoShim.new(chan)
      Resources::Service.process(shim, body)
      result = Transport.current.connection
      err    = result.calls[:publish].last
      expect(err).to be_kind_of(Array)
      expect(err.last).to be_kind_of(Hash)
      expect(err.last[:routing_key]).to be_kind_of(String)
      dev_id = err.last[:routing_key].split(".").second
      expect(dev_id).to eq("device_#{props[:device_id]}")
      body = JSON.parse(err.first, symbolize_names: true)
      expect(body[:kind]).to eq("rpc_error")
      expect(body[:args]).to be_kind_of(Hash)
      expect(body[:body]).to be_kind_of(Array)
      expl = body[:body].first
      expect(expl).to be_kind_of(Hash)
      expect(expl[:kind]).to eq("explanation")
      expect(expl[:args][:message]).to eq("body must be a JSON object")
    end

    it "handles semantic errors using step2" do
      Transport.current.connection.clear!
      dev = FactoryBot.create(:device)
      x   = Resources::Service.step2(action:      "wrong_action",
                                     device:      dev,
                                     body:        "wrong_body",
                                     resource_id: 0,
                                     resource:    "wrong_resource",
                                     uuid:        "wrong_uuid")
      call_args = x.calls[:publish].last
      message   = JSON.parse(call_args.first)
      options   = call_args.last
      expect(message).to         be_kind_of(Hash)
      expect(message["kind"]).to eq("rpc_error")
      expect(message.dig("args","label")).to eq("wrong_uuid")
      message.dig("body").pluck("args").pluck("message")
      errors = message.dig("body").pluck("args").pluck("message")
      expect(errors).to include("Action isn't an option")
      segment = options.fetch(:routing_key).split(".")
      expect(segment[0]).to eq("bot")
      expect(segment[1]).to eq("device_#{dev.id}")
      expect(segment[2]).to eq("from_api")
      expect(segment[3]).to eq(nil)
    end

    it "processes resources" do
      body   = {}.to_json
      chan   = Resources::CHANNEL_TPL % props
      before = PinBinding.count
      result = Resources::Service.process(DeliveryInfoShim.new(chan), body)
      expect(PinBinding.count).to be < before
    end
  end

  describe Resources::Job do
    it "executes deletion" do
      y = preprocessed
      before = PinBinding.count
      x = Resources::Job.run(y)
      expect(x.success?).to be true
      expect(before).to     be > PinBinding.count
    end

    it "crashes when attempting to process unsupported classes" do
      y               = preprocessed
      y[:resource]    = Device
      y[:resource_id] = y[:device].id
      xpect           = "PANIC: Tried to do batch op on Device"
      expect { Resources::Job.run(y) }.to raise_error(xpect)
    end
  end
end
