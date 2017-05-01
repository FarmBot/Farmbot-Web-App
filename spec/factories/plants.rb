FactoryGirl.define do
  factory :plant do
    device
    x { rand(1..1000) }
    y { rand(1..1000) }
    name { Faker::Pokemon.name }
    openfarm_slug "lettuce"
  end
end
