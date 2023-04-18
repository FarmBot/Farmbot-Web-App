FactoryBot.define do
  factory :farmware_installation do
    device
    url { Faker::Internet.url host: "example.com", path: "/#{SecureRandom.hex(16)}/manifest.json" }
  end
end
