require 'spec_helper'

describe FarmEvents::CleanExpired do
  let(:device)     { FactoryBot.create(:device, timezone: "America/Chicago") }
  let(:seq)        { FakeSequence.create(device: device) }
  let(:regimen)    do
    Regimens::Create.run!(device: device,
                          name:  "Test case 1",
                          color: "red",
                          regimen_items: [
                            { time_offset: 12, sequence_id: seq.id }
                          ])
  end
  let!(:farm_event) do
    FactoryBot.create(:farm_event,
                      start_time: 4.years.ago,
                      executable: regimen,
                      device:     device)
  end

  it "deletes expired farm events" do
    old_count = device.farm_events.count
    FarmEvents::CleanExpired.run!(device: device)
    expect(device.farm_events.count).to be < old_count
  end
end
