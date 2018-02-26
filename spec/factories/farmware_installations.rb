FactoryBot.define do
  factory :farmware_installation do
    device
    url { Faker::Internet.url + "/manifest.json" }
  end
end
