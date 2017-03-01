require 'spec_helper'

describe FarmEvents::GenerateCalendar do
  it 'Builds a list of dates' do
    start  = Time.now + 1.minute
    params = { start_time: start,
               end_time:   start + 1.hours,
               repeat:     5,
               time_unit:  "minutely" }
    calendar = FarmEvents::GenerateCalendar.run!(params)
    expect(calendar.first).to eq(params[:start_time])
    calendar.map { |date| expect(date).to be >= params[:start_time] }
    calendar.map { |date| expect(date).to be <= params[:end_time] }
    expect(calendar.length).to eq(13)
  end

  it 'hit a bug in production' do
    start  = Time.now + 1.minute
    finish = start    + 5.days
    params   = { start_time: start,
                 end_time:   finish,
                 repeat:     1,
                 time_unit:  "daily" }
    calendar = FarmEvents::GenerateCalendar.run!(params)
    expect(calendar.first.day).to eq(start.day)
    expect(calendar.length).to eq(6)
  end
end
