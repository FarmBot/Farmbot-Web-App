require "spec_helper"

RSpec.describe SensorReading, type: :model do
  let(:sensor_reading) { FactoryBot.create(:sensor_reading) }

  it "Has basic attributes" do
    expect(sensor_reading.device).to be_kind_of(Device)
    expect(sensor_reading.value).to  be_kind_of(Integer)
    expect(sensor_reading.pin).to    be_kind_of(Integer)
    expect(sensor_reading.x).to      be_kind_of(Float)
    expect(sensor_reading.y).to      be_kind_of(Float)
    expect(sensor_reading.z).to      be_kind_of(Float)
  end
end
