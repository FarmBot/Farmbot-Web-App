FactoryGirl.define do
  factory :plant do
    device
    name { Faker::Pokemon.name }
    openfarm_slug "lettuce"
  end
end
