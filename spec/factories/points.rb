FactoryGirl.define do
  factory :point do
    radius 1.5
    x { rand(1...550) }
    y { rand(1...550) }
    z { rand(1...550) }
    meta ({})
    device
    pointer { GenericPointer.new(device: device) }
  end
end
