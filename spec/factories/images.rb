FactoryGirl.define do
  factory :image do
    attachment File.open("./spec/fixture.jpg")
    meta ({x: 1, y: 2, z: 3})
    device
  end
end
