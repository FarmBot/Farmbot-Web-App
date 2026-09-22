require "spec_helper"

describe Sensor do
  it "defaults type to none" do
    expect(FactoryBot.create(:sensor).type).to eq("none")
  end

  it "validates type" do
    sensor = FactoryBot.build(:sensor, type: "invalid")

    expect(sensor.valid?).to be false
    expect(sensor.errors[:type].first).to include("must be one of")
  end
end
