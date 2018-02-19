require "spec_helper"

describe Sensors::Update do
  let(:sensor) { FactoryBot.create(:sensor) }

  it "updates a sensor object" do
    props = { sensor: sensor, pin: 29, label: "heyo", mode: 0 }
    result = Sensors::Update.run!(props)
    props.without(:sensor).to_a.map { |(k, v)| expect(result.send k).to eq(v) }
  end
end
