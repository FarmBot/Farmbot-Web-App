FactoryBot.define do
  factory :sensor_reading do
    device
    x { rand(1..500) }
    y { rand(1..500) }
    z { rand(1..500) }
    value { rand(0..1024) }
    pin { rand(1..540) }
  end
end
