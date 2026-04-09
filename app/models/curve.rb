class Curve < ApplicationRecord
  self.inheritance_column = "none"

  CURVE_TYPES = %w(water spread height).sort
  BAD_TYPE = "%{value} is not valid. Valid options are: " +
             CURVE_TYPES.map(&:inspect).join(", ")

  belongs_to :device
  validates :device, presence: true
  validates :name, uniqueness: { scope: :device }
  validates :type, inclusion: { in: CURVE_TYPES,
                                message: BAD_TYPE }
  serialize :data, coder: YAML
end
