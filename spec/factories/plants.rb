FactoryBot.define do
  factory :plant do
    radius 1.5
    x { rand(1...550) }
    y { rand(1...550) }
    z { rand(1...550) }
    meta ({})
    device
    openfarm_slug "lettuce"
    pointer_type  "Plant"
  end
end
