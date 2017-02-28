require 'spec_helper'

describe FarmEvents::Create do
  let(:seq) { FactoryGirl.create(:sequence) }
  it 'Builds a farm_event' do
    device = seq.device
    start_time = '2015-02-17T15:16:17.000Z'
    end_time = '2099-02-17T18:19:20.000Z'
    farm_event = FarmEvents::Create.run!(device:          device,
                                         executable_id:   seq.id,
                                         executable_type: seq.class.name,
                                         executable:      seq,
                                         start_time:      start_time,
                                         end_time:        end_time,
                                         repeat:          4,
                                         time_unit:       'minutely').reload
    expect(farm_event).to be_kind_of(FarmEvent)
    expect(farm_event.device).to eq(device)
    expect(farm_event.executable).to eq(seq)
    expect(farm_event.start_time.to_time).to eq(Time.parse start_time)
    expect(farm_event.end_time.to_time).to eq(Time.parse end_time)
    expect(farm_event.repeat).to eq(4)
    expect(farm_event.time_unit).to eq('minutely')
    # expect(farm_event.next_time).to eq(farm_event.calculate_next_occurence)
  end

  it 'has a calendar' do
     pending(
       "SEE: https://github.com/seejohnrun/ice_cube/issues/378"
     )
     x = FarmEvents::Create.run!({ start_time:     "2017-02-24T13:04:07.754Z",
                                   end_time:       "2017-02-26T13:30:00.000Z",
                                   device:         seq.device,
                                   repeat:          2,
                                   time_unit:       "hourly",
                                   executable_id:   seq.id,
                                   executable_type: seq.class.name })
    expect(x.calendar.length).to eq(25)
  end
end
