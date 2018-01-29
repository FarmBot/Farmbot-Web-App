
FactoryBot.define do
  factory :image do
    attachment { StringIO.new(File.open("./spec/fixture.jpg").read) }
    meta ({x: 1, y: 2, z: 3})
    device
  end
end
