# Read about factories at https://github.com/thoughtbot/factory_bot
require 'securerandom'

FactoryBot.define do
  factory :device do
    name  { Haikunator.haikunate(1000) }
    timezone { Device::TIMEZONES.sample }
  end
end
