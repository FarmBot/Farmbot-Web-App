require "spec_helper"

describe Sensors::Create do
  let(:device) { FactoryBot.create(:device) }

  it "instantiates a sensor object" do
    props = {device: device, pin: 1, label: "One", mode: 0}
    obj = Sensors::Create.run!(props)
    props.to_a.map { |(key, val)| expect(obj.send(key)).to eq(val)}
  end

  it "disallows bad PIN_MODEs" do
    props = {device: device, pin: 1, label: "One", mode: -1}
    result = Sensors::Create.run(props)
    err = result.errors["mode"]
    expect(err).to be
    expect(err.message).to include("not a valid pin")
  end
end
