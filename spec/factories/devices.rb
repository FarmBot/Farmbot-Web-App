# Read about factories at https://github.com/thoughtbot/factory_girl
require 'securerandom'

FactoryGirl.define do
  factory :device do
    name  {
      Haikunator.haikunate(1000)
    }
    webcam_url { Faker::Company.logo }
  end
end
