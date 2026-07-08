module SceneObjects
  class Create < Mutations::Command
    include SceneObjects::Helpers

    required do
      model :device, class: Device
      string :name
      string :texture
      string :shape
      string :color
      string :x_origin
      string :y_origin
      string :z_origin
      integer :x_center
      integer :y_center
      integer :z_base
      integer :x_size
      integer :y_size
      integer :z_size
    end

    def validate
      validate_texture
      validate_shape
      validate_x_origin
      validate_y_origin
      validate_z_origin
    end

    def execute
      SceneObject.create!(inputs)
    end
  end
end
