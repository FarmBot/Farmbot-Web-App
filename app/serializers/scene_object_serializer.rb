class SceneObjectSerializer < ApplicationSerializer
  attributes :created_at,
             :updated_at,
             :name,
             :texture,
             :color,
             :shape,
             :x_origin,
             :y_origin,
             :z_origin,
             :x_center,
             :y_center,
             :z_base,
             :x_size,
             :y_size,
             :z_size
end
