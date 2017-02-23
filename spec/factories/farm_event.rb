FactoryGirl.define do
  factory :farm_event do
    start_time { Date.yesterday - [*(1..5)].sample.days }
    end_time { Date.today + 1.minute + ([*(1..5)].sample).days }
    time_unit { FarmEvent::UNITS_OF_TIME.sample }
    repeat { [*(1..5)].sample }
    # device
    after(:build) do |s|
      s.next_time ||= s.calculate_next_occurence
      s.executable ||= create(:sequence)
      s.device ||= s.executable.device
    end
  end
end
