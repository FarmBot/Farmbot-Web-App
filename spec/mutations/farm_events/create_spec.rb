require 'spec_helper'

describe FarmEvents::Create do
  let(:seq) { FakeSequence.create() }
  it 'Builds a farm_event' do
    device = seq.device
    start_time = '2027-02-17T15:16:17.000Z'
    end_time = '2029-02-17T18:19:20.000Z'
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
  end
  it 'Prevents backwards start/end times' do
    device = seq.device
    start_time = '2015-02-17T15:16:17.000Z'
    end_time = '2099-02-17T18:19:20.000Z'
    farm_event = FarmEvents::Create.run(device:          device,
                                         executable_id:   seq.id,
                                         executable_type: seq.class.name,
                                         executable:      seq,
                                         start_time:      end_time,
                                         end_time:        start_time,
                                         repeat:          4,
                                         time_unit:       'minutely')
    expect(farm_event.errors["end_time"]).to be
    expect(farm_event.errors["end_time"].message)
      .to include(FarmEvents::Create::BACKWARDS_END_TIME)
  end



  it "disallows creation of farm events with 5 digit years" do
    device = seq.device
    start_time = "+099999-08-18T12:32:00.000Z"
    end_time   = "+099999-08-19T12:32:00.000Z"
    farm_event = FarmEvents::Create.run(device:          device,
                                         executable_id:   seq.id,
                                         executable_type: seq.class.name,
                                         executable:      seq,
                                         end_time:        end_time,
                                         start_time:      start_time,
                                         repeat:          4,
                                         time_unit:       'minutely')
    expect(farm_event.errors.message_list.join)
      .to include("too far in the future")
  end
end
