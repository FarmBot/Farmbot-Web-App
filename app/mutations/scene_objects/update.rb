module SceneObjects
  class Update < Mutations::Command
    include SceneObjects::Helpers

    EXCLUDED_FIELDS = [:device, :scene_object]

    required do
      model :device, class: Device
      model :scene_object, class: SceneObject
    end

    optional do
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
      scene_object.update!(update_attributes) && scene_object
    end

    private

    def update_attributes
      @update_attributes ||= inputs
        .except(*EXCLUDED_FIELDS)
    end
  end
end
