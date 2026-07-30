module SceneObjects
  class Create < Mutations::Command
    include SceneObjects::Helpers

    MAX_SCENE_OBJECT_COUNT = 1000
    TOO_MANY_SCENE_OBJECTS = "Your device has %s scene objects. " \
      "The maximum allowed is %s. Please delete unused" \
      " scene objects to create more."

    required do
      model :device, class: Device
      string :name
      string :texture
      string :shape
      string :color
      boolean :show, default: true
      string :x_origin
      string :y_origin
      string :z_origin
      integer :x_center, min: -Helpers::INTEGER_LIMIT, max: Helpers::INTEGER_LIMIT
      integer :y_center, min: -Helpers::INTEGER_LIMIT, max: Helpers::INTEGER_LIMIT
      integer :z_base, min: -Helpers::INTEGER_LIMIT, max: Helpers::INTEGER_LIMIT
      integer :x_size, min: 0, max: Helpers::INTEGER_LIMIT
      integer :y_size, min: 0, max: Helpers::INTEGER_LIMIT
      integer :z_size, min: 0, max: Helpers::INTEGER_LIMIT
      integer :rotation, min: -180, max: 180
    end

    def validate
      validate_texture
      validate_shape
      validate_x_origin
      validate_y_origin
      validate_z_origin

      validate_resource_count
    end

    def execute
      SceneObject.create!(inputs)
    end

    private

    def validate_resource_count
      count = SceneObject.where(device_id: device.id).count
      if count >= MAX_SCENE_OBJECT_COUNT
        message = format(TOO_MANY_SCENE_OBJECTS, count, MAX_SCENE_OBJECT_COUNT)
        add_error(:scene_object_count, :limit, message)
      end
    end
  end
end
