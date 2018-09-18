FactoryBot.define do
  factory :generic_pointer do
    radius { 1.5 }
    x { rand(1...550) }
    y { rand(1...550) }
    z { rand(1...550) }
    meta {({})}
    device
    pointer_type { GenericPointer.name }
  end
end
