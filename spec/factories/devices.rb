FactoryBot.define do
  factory :device do
    name  { Haikunator.haikunate(1000) }
    timezone { Device::TIMEZONES.sample }
  end
end
