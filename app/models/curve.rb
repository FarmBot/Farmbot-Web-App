class Curve < ApplicationRecord
  self.inheritance_column = "none"

  CURVE_TYPES = %w(water spread height).sort
  BAD_TYPE = "%{value} is not valid. Valid options are: " +
      CURVE_TYPES.map(&:inspect).join(", ")

  belongs_to :device
  validates :device, presence: true
  validates :name, uniqueness: { scope: :device }
  validates_inclusion_of :type, in: CURVE_TYPES,
                                message: BAD_TYPE
  serialize :data

  def broadcast?
    false
  end
end
