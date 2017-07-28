require 'spec_helper'

describe FarmEventSerializer do
  it 'renders a calendar based on a regimen' do
    device   = FactoryGirl.create(:device)
    sequence = FactoryGirl.create(:sequence, device: device)
    reg      = Regimens::Create.run!(device: device,
                                     name:   "Hey.",
                                     color:  "red",
                                     regimen_items: [
                                       { sequence_id: sequence.id,
                                         time_offset: (1.hour.to_i * 1000) },
                                       { sequence_id: sequence.id,
                                         time_offset: (4.hour.to_i * 1000) },
                                     ])
    epoch    = Time.now.tomorrow.midnight
    fe       = FarmEvent.create!(start_time: epoch,
                                 device:     device,
                                 repeat:     1,
                                 time_unit:  "never",
                                 executable: reg)
    results  = FarmEventSerializer.new(fe).calendar
    expect(results.first).to eq(epoch + 1.hour)
    expect(results.last).to eq(epoch + 4.hours)
  end
end
