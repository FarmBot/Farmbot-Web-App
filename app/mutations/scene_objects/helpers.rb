module SceneObjects
  module Helpers
    def validate_texture
      if texture
        bad_texture! unless valid_texture?
      end
    end

    def bad_texture!
      add_error :texture,
                :texture_bad,
                format(SceneObject::BAD_TEXTURE_TYPE, value: texture)
    end

    def valid_texture?
      SceneObject::TEXTURE_TYPES.include?(texture)
    end

    def validate_shape
      if shape
        bad_shape! unless valid_shape?
      end
    end

    def bad_shape!
      add_error :shape,
                :shape_bad,
                format(SceneObject::BAD_SHAPE_TYPE, value: shape)
    end

    def valid_shape?
      SceneObject::SHAPE_TYPES.include?(shape)
    end

    def validate_x_origin
      if x_origin
        bad_x_origin! unless valid_x_origin?
      end
    end

    def bad_x_origin!
      add_error :x_origin,
                :x_origin_bad,
                format(SceneObject::BAD_ORIGIN_TYPE, value: x_origin)
    end

    def valid_x_origin?
      SceneObject::ORIGIN_TYPES.include?(x_origin)
    end

    def validate_y_origin
      if y_origin
        bad_y_origin! unless valid_y_origin?
      end
    end

    def bad_y_origin!
      add_error :y_origin,
                :y_origin_bad,
                format(SceneObject::BAD_ORIGIN_TYPE, value: y_origin)
    end

    def valid_y_origin?
      SceneObject::ORIGIN_TYPES.include?(y_origin)
    end

    def validate_z_origin
      if z_origin
        bad_z_origin! unless valid_z_origin?
      end
    end

    def bad_z_origin!
      add_error :z_origin,
                :z_origin_bad,
                format(SceneObject::BAD_ORIGIN_TYPE, value: z_origin)
    end

    def valid_z_origin?
      SceneObject::ORIGIN_TYPES.include?(z_origin)
    end
  end
end
