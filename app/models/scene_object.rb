class SceneObject < ApplicationRecord
  TEXTURE_TYPES = %w(cloud grass wood soil sand aluminum concrete screen bricks water none).sort
  BAD_TEXTURE_TYPE = "%{value} is not valid. Valid options are: " +
                     TEXTURE_TYPES.map(&:inspect).join(", ")
  SHAPE_TYPES = %w(box cylinder sphere plant tray window laptop desk solar tree fence).sort
  BAD_SHAPE_TYPE = "%{value} is not valid. Valid options are: " +
                   SHAPE_TYPES.map(&:inspect).join(", ")
  ORIGIN_TYPES = %w(home max world).sort
  BAD_ORIGIN_TYPE = "%{value} is not valid. Valid options are: " +
                    ORIGIN_TYPES.map(&:inspect).join(", ")

  belongs_to :device
  validates :device, presence: true
  validates :name, uniqueness: { scope: :device }
  validates :texture, inclusion: { in: TEXTURE_TYPES,
                                   message: BAD_TEXTURE_TYPE }
  validates :shape, inclusion: { in: SHAPE_TYPES,
                                 message: BAD_SHAPE_TYPE }
  validates :x_origin, inclusion: { in: ORIGIN_TYPES,
                                    message: BAD_ORIGIN_TYPE }
  validates :y_origin, inclusion: { in: ORIGIN_TYPES,
                                    message: BAD_ORIGIN_TYPE }
  validates :z_origin, inclusion: { in: ORIGIN_TYPES,
                                    message: BAD_ORIGIN_TYPE }
end
