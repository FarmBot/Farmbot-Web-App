require "spec_helper"

describe Sensors::Destroy do
  let(:sensor) { FactoryBot.create(:sensor) }

  it "destroys a sensor object" do
    id     = sensor.id
    result = Sensors::Destroy.run!(sensor: sensor)
    expect(Sensor.exists?(id)).to be false
  end

  it "doesn't destroy a sensor if it's in use" do
    before = Sensor.count
    FactoryBot.create(:sequence,
                      device: sensor.device,
                      body: [{kind: "read_pin",
                              args: {
                                pin_number: {
                                  kind: "named_pin",
                                  args: { pin_type: "Sensor", pin_id: sensor.id }
                                },
                                mode: 0,
                                label: "FOO"
                              }
                            }])
    result = Sensors::Destroy.run(sensor: sensor)
    expect(result.errors).to be
    expect(Sensor.count).to eq(before)
    expect(result.errors["sensor"].message)
      .to include("sequences are still using it")
  end
end
