FactoryBot.define do
  factory :plant_template do
    radius 1.5
    x { rand(1...550) }
    y { rand(1...550) }
    z { rand(1...550) }
    device
    openfarm_slug "lettuce"
  end
end
