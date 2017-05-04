FactoryGirl.define do
  factory :point do
    radius 1.5
    x { rand(1...550) }
    y { rand(1...550) }
    z { rand(1...550) }
    meta ({})
    device
    pointer { GenericPointer.new }
    trait :plant_point do
      pointer { Plant.new(openfarm_slug: "lettuce") }
    end
    factory :plant_point, traits: [:plant_point]
  end
end
