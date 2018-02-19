require "spec_helper"

describe Sensors::Destroy do
  let(:sensor) { FactoryBot.create(:sensor) }

  it "destroys a sensor object" do
    id     = sensor.id
    result = Sensors::Destroy.run!(sensor: sensor)
    expect(Sensor.exists?(id)).to be false
  end
end
