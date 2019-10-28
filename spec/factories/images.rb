
FactoryBot.define do
  factory :image do
    meta { ({ x: 1, y: 2, z: 3 }) }
    device
  end
end
