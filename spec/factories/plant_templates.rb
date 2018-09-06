FactoryBot.define do
  factory :plant_template do
    openfarm_slug { "lettuce" }
    radius        { 1.5 }
    x             { rand(1...550) }
    y             { rand(1...550) }
    z             { rand(1...550) }
    saved_garden  { FactoryBot.create(:saved_garden, device: device) }
    device
  end
end
