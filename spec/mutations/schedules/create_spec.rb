require 'spec_helper'

describe Schedules::Create do
  it 'Builds a schedule' do
    seq = FactoryGirl.create(:sequence)
    user = seq.user
    start_time = '2015-02-17T15:16:17.000Z'
    end_time = '2099-02-17T18:19:20.000Z'
    schedule = Schedules::Create.run!(user: user,
                                      sequence: seq,
                                      start_time: start_time,
                                      end_time: end_time,
                                      repeat: 4,
                                      time_unit: 'minutely').reload
    expect(schedule).to be_kind_of(Schedule)
    expect(schedule.user).to eq(user)
    expect(schedule.sequence).to eq(seq)
    expect(schedule.start_time.to_time).to eq(Time.parse start_time)
    expect(schedule.end_time.to_time).to eq(Time.parse end_time)
    expect(schedule.repeat).to eq(4)
    expect(schedule.time_unit).to eq('minutely')
    expect(schedule.next_time).to eq(schedule.calculate_next_occurence)
  end
end
