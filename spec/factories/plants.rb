FactoryGirl.define do
  factory :plant do
    device
    x { rand(1..1000) }
    y { rand(1..1000) }
    name { Faker::Pokemon.name }
    img_url Faker::Placeholdit.image("50x50")
    icon_url Faker::Placeholdit.image("32x32")
    openfarm_slug "lettuce"
  end
end
