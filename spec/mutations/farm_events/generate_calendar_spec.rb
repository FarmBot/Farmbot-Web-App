require 'spec_helper'

describe FarmEvents::GenerateCalendar do
  # SCENARIO:
  # You have...
  #   A "lower limit" time (lowest end_time of all farm events).
  #   An "upper limit" time (highest end time of all farm events).
  #   A "slice start" time (Time.now, usually)
  #   A "slice end" time (maybe nil, maybe (Time.now + 1.year))
  #
  # You need...
  #   All times from slice_start to slice_end
  #   Can't expire a FarmEvent's Regimen until last RI is done.
  #     * This probably works OK still ^
  #   STILL A SUSPECT: GenerateCalendar
  # Maybe...
  #   We just create a new "calendar" resource that is seperate from FarmEvents,
  #     Sequences, Regimens...?
  #  JUST AN IDEA .. . . .. . . .
  #
  # GET /api/calendar?start=5/19/18&end=5/21/18
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
    expect(calendar.length).to eq(12)
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
    expect(calendar.length).to be > 4
    expect(calendar.length).to be < 7
  end

  it 'has a known calendar bug' do
    tomorrow = Time.now + 1.day
    calendar = FarmEvents::GenerateCalendar.run!(
     "start_time" => tomorrow,
     "end_time"   => tomorrow + 10.hours,
     "repeat"     => 2,
     "time_unit"  => "hourly")

    expect(calendar.length).to be > 3
    expect(calendar.length).to be < 7
  end

  it 'hit more bugs' do
    tomorrow = Time.now + 1.day
    calendar = FarmEvents::GenerateCalendar.run!("start_time" => tomorrow,
                                                 "end_time"   => tomorrow + 5.minutes,
                                                 "repeat"     => 1,
                                                 "time_unit"  => "minutely")

    expect(calendar.length).to be > 3
    expect(calendar.length).to be < 7
  end

  it 'schedules one-off events' do
    tomorrow = Time.now + 1.day
    params   = { start_time: tomorrow,
                 end_time:   nil,
                 repeat:     1,
                 time_unit:  FarmEvent::NEVER }
    calendar = FarmEvents::GenerateCalendar.run!(params)
    expect(calendar.length).to eq(1)
    expect(calendar.first).to eq(params[:start_time])
  end
end
