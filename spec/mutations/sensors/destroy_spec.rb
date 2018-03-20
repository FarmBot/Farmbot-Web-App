require "spec_helper"

describe Sensors::Destroy do
  let(:sensor) { FactoryBot.create(:sensor) }

  it "destroys a sensor object" do
    id     = sensor.id
    result = Sensors::Destroy.run!(sensor: sensor)
    expect(Sensor.exists?(id)).to be false
  end

  it "doesn't destroy a sensor if it's in use" do
    puts "Boom"
    FakeSequence.create(device: sensor.device,
                        body: [{
                          kind: "read_pin",
                          args: {
                            pin_mode: 0,
                            label: "FOO",
                            pin_number: {
                              kind: "named_pin",
                              args: {
                                pin_type: "Sensor",
                                pin_id: sensor.id
                              }
                            },
                          }
                        }
                      ])
    before = Sensor.count
    result = Sensors::Destroy.run(sensor: sensor)
    expect(result.errors).to be
    expect(result.errors["sensor"].message)
    .to include("sequences are still using it")
    expect(Sensor.count).to eq(before)
  end
end
