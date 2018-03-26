FactoryBot.define do
  factory :device do
    name  { Faker::StarWars.call_sign }
    timezone { Device::TIMEZONES.sample }
  end
end
