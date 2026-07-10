FactoryBot.define do
  factory :scene_object do
    name { SecureRandom.uuid }
    texture { "none" }
    shape { "box" }
    color { "#fff" }
    x_origin { "home" }
    y_origin { "home" }
    z_origin { "world" }
    x_center { 0 }
    y_center { 0 }
    z_base { 0 }
    x_size { 100 }
    y_size { 100 }
    z_size { 100 }
    device
  end
end
